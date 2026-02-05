use anyhow::Result;
use crossterm::{
    event::{self, DisableMouseCapture, EnableMouseCapture, Event, KeyCode},
    execute,
    terminal::{disable_raw_mode, enable_raw_mode, EnterAlternateScreen, LeaveAlternateScreen},
};
use ratatui::{
    backend::{Backend, CrosstermBackend},
    layout::{Constraint, Direction, Layout, Rect},
    style::{Color, Modifier, Style},
    text::{Line, Span},
    widgets::{Block, Borders, Clear, Paragraph, Wrap, List, ListItem, ListState},
    Frame, Terminal,
};
use std::{io, process::Command, time::Duration, fs};
use std::sync::mpsc::{self, Receiver};
use std::thread;
use std::path::PathBuf;
use chrono::Local;

use crate::state::LearningState;
use crate::config::{AppConfig, AiProvider};
use crate::generator::ExerciseGenerator;

#[derive(PartialEq)]
enum UiMode {
    Normal,
    InputTopic,
    Generating,
    SelectProvider,
    InputApiKey,
    ViewingMarkdown,
}

#[derive(Clone, Copy)]
enum TaskType {
    GenerateExercise,
    Explain,
    Review,
}

struct App {
    state: LearningState,
    config: AppConfig,
    output: String,
    status_msg: String,
    scroll: u16,

    // AI / UI State
    mode: UiMode,
    input_buffer: String,
    provider_list_state: ListState,
    generation_rx: Option<Receiver<Result<String, String>>>, // String can be Path or Content
    spinner_frame: usize,
    current_task: Option<TaskType>,

    // Markdown Viewer
    markdown_content: String,
    markdown_scroll: u16,
}

impl App {
    fn new(state: LearningState, config: AppConfig) -> App {
        let mut list_state = ListState::default();
        list_state.select(Some(0));

        App {
            state,
            config,
            output: String::from("Press 'r' to run code. Press 'q' to quit. Press 'g' to generate exercise."),
            status_msg: String::from("Ready"),
            scroll: 0,
            mode: UiMode::Normal,
            input_buffer: String::new(),
            provider_list_state: list_state,
            generation_rx: None,
            spinner_frame: 0,
            current_task: None,
            markdown_content: String::new(),
            markdown_scroll: 0,
        }
    }

    fn run_test(&mut self) {
        self.status_msg = String::from("Compiling...");
        self.output = String::from("Running tests...\n");

        if let Some(path) = self.find_current_exercise_path() {
             let temp_output = if cfg!(target_os = "windows") { "temp_test.exe" } else { "temp_test" };

             let compile = Command::new("rustc")
                .arg("--test")
                .arg(&path)
                .arg("-o")
                .arg(temp_output)
                .output();

             match compile {
                 Ok(output) => {
                     if output.status.success() {
                         self.output.push_str("Compilation Successful.\nExecuting...\n");
                         let run = Command::new(format!("./{}", temp_output)).output();
                         match run {
                             Ok(run_out) => {
                                 let stdout = String::from_utf8_lossy(&run_out.stdout);
                                 let stderr = String::from_utf8_lossy(&run_out.stderr);
                                 self.output.push_str(&stdout);
                                 self.output.push_str(&stderr);

                                 if run_out.status.success() {
                                     self.status_msg = String::from("Passed! Press 'n' for next.");
                                     let ex_name = self.state.current_exercise.clone();
                                     self.state.mark_completed(&ex_name);
                                     let _ = self.state.save();
                                 } else {
                                     self.status_msg = String::from("Failed. Check output.");
                                 }
                             }
                             Err(e) => self.output.push_str(&format!("Execution error: {}", e)),
                         }
                         let _ = std::fs::remove_file(temp_output);
                         if cfg!(target_os = "windows") {
                             let _ = std::fs::remove_file(format!("{}.pdb", temp_output.replace(".exe", "")));
                         }
                     } else {
                         self.status_msg = String::from("Compilation Failed");
                         self.output.push_str(&String::from_utf8_lossy(&output.stderr));
                     }
                 }
                 Err(e) => self.output.push_str(&format!("Rustc error: {}", e)),
             }
        } else {
            self.output = format!("Exercise {} file not found!", self.state.current_exercise);
        }
    }

    fn find_current_exercise_path(&self) -> Option<PathBuf> {
        let ex_name = &self.state.current_exercise;
        let search_dirs = vec!["src/exercises", "src/practice"];
        for dir in search_dirs {
            for entry in walkdir::WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
                if entry.path().file_stem().map(|s| s.to_str()).flatten() == Some(ex_name.as_str()) {
                    return Some(entry.path().to_path_buf());
                }
            }
        }
        None
    }

    fn next_exercise(&mut self) {
        let current = &self.state.current_exercise;
        if let Some(pos) = current.find(|c: char| c.is_numeric()) {
            let prefix = &current[..pos];
            let num_str = &current[pos..];
            if let Ok(num) = num_str.parse::<u32>() {
                let next_name = format!("{}{}", prefix, num + 1);
                let mut exists = false;
                 for dir in ["src/exercises", "src/practice"] {
                    for entry in walkdir::WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
                        if entry.path().file_stem().map(|s| s.to_str()).flatten() == Some(&next_name) {
                            exists = true;
                            break;
                        }
                    }
                }

                if exists {
                    self.state.current_exercise = next_name;
                    self.status_msg = format!("Loaded {}", self.state.current_exercise);
                    self.output = String::from("New exercise loaded. Read the file, solve it, then press 'r'.");
                    let _ = self.state.save();
                } else {
                     self.status_msg = String::from("No more exercises in this series!");
                }
            }
        }
    }

    fn ensure_config(&mut self) -> bool {
        if self.config.active_provider.is_none() {
            self.mode = UiMode::SelectProvider;
            return false;
        }
        true
    }

    fn start_generation(&mut self) {
        if !self.ensure_config() { return; }
        self.mode = UiMode::InputTopic;
        self.input_buffer.clear();
        self.current_task = Some(TaskType::GenerateExercise);
    }

    fn start_explanation(&mut self) {
        if !self.ensure_config() { return; }

        let path = match self.find_current_exercise_path() {
            Some(p) => p,
            None => { self.status_msg = "Exercise not found!".to_string(); return; }
        };

        let code = fs::read_to_string(path).unwrap_or_default();
        let error = if self.output.contains("error") || self.output.contains("Failed") {
            Some(self.output.clone())
        } else {
            None
        };

        self.launch_ai_task(TaskType::Explain, move |generator| {
            generator.generate_explanation(&code, error.as_deref()).map_err(|e| e.to_string())
        });
    }

    fn start_review(&mut self) {
        if !self.ensure_config() { return; }

        let path = match self.find_current_exercise_path() {
            Some(p) => p,
            None => { self.status_msg = "Exercise not found!".to_string(); return; }
        };

        let code = fs::read_to_string(path).unwrap_or_default();

        self.launch_ai_task(TaskType::Review, move |generator| {
            generator.generate_review(&code).map_err(|e| e.to_string())
        });
    }

    fn launch_ai_task<F>(&mut self, task_type: TaskType, f: F)
    where F: FnOnce(&ExerciseGenerator) -> Result<String, String> + Send + 'static
    {
        self.mode = UiMode::Generating;
        self.status_msg = String::from("Working... (this may take a minute)");
        self.current_task = Some(task_type);

        let (tx, rx) = mpsc::channel();
        let config = self.config.clone();

        thread::spawn(move || {
            let generator = ExerciseGenerator::new(config);
            let res = f(&generator);
            let _ = tx.send(res);
        });

        self.generation_rx = Some(rx);
    }

    fn submit_input(&mut self) {
        match self.mode {
            UiMode::InputTopic => {
                let topic = self.input_buffer.clone();
                if topic.trim().is_empty() { return; }

                self.launch_ai_task(TaskType::GenerateExercise, move |generator| {
                    generator.generate_exercise(&topic).map(|p| p.to_string_lossy().to_string()).map_err(|e| e.to_string())
                });
            },
            UiMode::InputApiKey => {
                let key = self.input_buffer.clone();
                if key.trim().is_empty() { return; }

                if let Some(provider) = &self.config.active_provider {
                    self.config.set_api_key(provider.clone(), key);
                    let _ = self.config.save();
                    self.status_msg = String::from("API Key saved.");

                    // Resume previous intent
                    if let Some(task) = self.current_task {
                        match task {
                            TaskType::GenerateExercise => {
                                self.mode = UiMode::InputTopic;
                                self.input_buffer.clear();
                            },
                             _ => {
                                 // For Explain/Review, we can just restart it
                                 self.mode = UiMode::Normal;
                                 match task {
                                     TaskType::Explain => self.start_explanation(),
                                     TaskType::Review => self.start_review(),
                                     _ => {}
                                 }
                             }
                        }
                    } else {
                         self.mode = UiMode::Normal;
                    }
                }
            },
            _ => {}
        }
    }

    fn select_provider(&mut self) {
        let providers = vec![AiProvider::OpenAI, AiProvider::Gemini, AiProvider::Grok];
        if let Some(idx) = self.provider_list_state.selected() {
            let selected = providers[idx].clone();
            self.config.active_provider = Some(selected.clone());

            // Check if we have a key
            if self.config.get_api_key(&selected).is_some() {
                 // Resume
                 if let Some(task) = self.current_task {
                     match task {
                         TaskType::GenerateExercise => {
                             self.mode = UiMode::InputTopic;
                             self.input_buffer.clear();
                         },
                         _ => {
                              self.mode = UiMode::Normal;
                              match task {
                                     TaskType::Explain => self.start_explanation(),
                                     TaskType::Review => self.start_review(),
                                     _ => {}
                                 }
                         }
                     }
                 } else {
                     self.mode = UiMode::Normal;
                 }
            } else {
                self.mode = UiMode::InputApiKey;
                self.input_buffer.clear();
            }
        }
    }

    fn save_markdown_response(&self, content: &str, task: TaskType) {
        let timestamp = Local::now().format("%Y%m%d_%H%M%S");
        let task_str = match task {
            TaskType::Explain => "explain",
            TaskType::Review => "review",
            _ => "unknown",
        };
        let exercise = &self.state.current_exercise;
        let filename = format!("{}_{}_{}.md", exercise, task_str, timestamp);
        let dir = PathBuf::from(".rustflow/explanations");

        // Ensure directory exists (config does it too, but just in case)
        let _ = fs::create_dir_all(&dir);

        let path = dir.join(filename);
        let _ = fs::write(path, content);
    }
}

pub fn run_tui() -> Result<()> {
    enable_raw_mode()?;
    let mut stdout = io::stdout();
    execute!(stdout, EnterAlternateScreen, EnableMouseCapture)?;
    let backend = CrosstermBackend::new(stdout);
    let mut terminal = Terminal::new(backend)?;

    let state = LearningState::load()?;
    let config = AppConfig::load()?; // Load config
    let mut app = App::new(state, config);

    let res = run_app(&mut terminal, &mut app);

    disable_raw_mode()?;
    execute!(
        terminal.backend_mut(),
        LeaveAlternateScreen,
        DisableMouseCapture
    )?;
    terminal.show_cursor()?;

    if let Err(err) = res {
        println!("{:?}", err);
    }

    Ok(())
}

fn run_app<B: Backend>(terminal: &mut Terminal<B>, app: &mut App) -> io::Result<()> {
    loop {
        terminal.draw(|f| ui(f, app))?;

        // Handle background tasks
        if let Some(rx) = &app.generation_rx {
             if let Ok(result) = rx.try_recv() {
                 match result {
                     Ok(content) => {
                         app.status_msg = String::from("Success!");
                         match app.current_task {
                             Some(TaskType::GenerateExercise) => {
                                 let path = PathBuf::from(content);
                                 app.output = format!("Generated exercise at {}\n\nPress 'r' to run it after you review the code.", path.display());
                                 if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                                     app.state.current_exercise = stem.to_string();
                                     let _ = app.state.save();
                                 }
                                 app.mode = UiMode::Normal;
                             },
                             Some(TaskType::Explain) | Some(TaskType::Review) => {
                                 app.save_markdown_response(&content, app.current_task.unwrap());
                                 app.markdown_content = content;
                                 app.markdown_scroll = 0;
                                 app.mode = UiMode::ViewingMarkdown;
                             },
                             None => { app.mode = UiMode::Normal; }
                         }
                     },
                     Err(e) => {
                         app.status_msg = String::from("Operation Failed");
                         app.output = format!("Error: {}", e);
                         app.mode = UiMode::Normal;
                     }
                 }
                 app.generation_rx = None;
                 app.current_task = None;
             }
             app.spinner_frame = (app.spinner_frame + 1) % 4;
        }

        if event::poll(Duration::from_millis(100))? {
            if let Event::Key(key) = event::read()? {
                match app.mode {
                    UiMode::Normal => {
                         match key.code {
                            KeyCode::Char('q') => return Ok(()),
                            KeyCode::Char('r') => app.run_test(),
                            KeyCode::Char('n') => app.next_exercise(),
                            KeyCode::Char('g') => app.start_generation(),
                            KeyCode::Char('e') => app.start_explanation(),
                            KeyCode::Char('v') => app.start_review(),
                            KeyCode::Char('j') | KeyCode::Down => {
                                 if app.scroll < 1000 { app.scroll += 1; }
                            }
                            KeyCode::Char('k') | KeyCode::Up => {
                                 if app.scroll > 0 { app.scroll -= 1; }
                            }
                            _ => {}
                        }
                    },
                    UiMode::InputTopic | UiMode::InputApiKey => {
                        match key.code {
                            KeyCode::Enter => app.submit_input(),
                            KeyCode::Esc => app.mode = UiMode::Normal,
                            KeyCode::Char(c) => app.input_buffer.push(c),
                            KeyCode::Backspace => { app.input_buffer.pop(); },
                            _ => {}
                        }
                    },
                    UiMode::SelectProvider => {
                         match key.code {
                            KeyCode::Enter => app.select_provider(),
                            KeyCode::Esc => app.mode = UiMode::Normal,
                            KeyCode::Up => {
                                let i = match app.provider_list_state.selected() {
                                    Some(i) => if i == 0 { 2 } else { i - 1 },
                                    None => 0,
                                };
                                app.provider_list_state.select(Some(i));
                            },
                            KeyCode::Down => {
                                let i = match app.provider_list_state.selected() {
                                    Some(i) => if i >= 2 { 0 } else { i + 1 },
                                    None => 0,
                                };
                                app.provider_list_state.select(Some(i));
                            },
                            _ => {}
                         }
                    }
                    UiMode::ViewingMarkdown => {
                        match key.code {
                            KeyCode::Esc | KeyCode::Char('q') => app.mode = UiMode::Normal,
                            KeyCode::Char('j') | KeyCode::Down => {
                                if app.markdown_scroll < 1000 { app.markdown_scroll += 1; }
                            },
                            KeyCode::Char('k') | KeyCode::Up => {
                                if app.markdown_scroll > 0 { app.markdown_scroll -= 1; }
                            },
                            _ => {}
                        }
                    }
                    UiMode::Generating => {
                        if key.code == KeyCode::Esc {
                             app.mode = UiMode::Normal;
                             app.generation_rx = None;
                             app.status_msg = String::from("Operation Cancelled");
                        }
                    }
                }
            }
        }
    }
}

fn ui(f: &mut Frame, app: &App) {
    let chunks = Layout::default()
        .direction(Direction::Vertical)
        .constraints(
            [
                Constraint::Length(3),
                Constraint::Min(0),
                Constraint::Length(3),
            ]
            .as_ref(),
        )
        .split(f.size());

    // Title
    let title = Paragraph::new(format!("Rust Learning Flow - User: {}", app.state.user))
        .block(Block::default().borders(Borders::ALL).style(Style::default().fg(Color::Cyan)));
    f.render_widget(title, chunks[0]);

    // Main Content
    let main_chunks = Layout::default()
        .direction(Direction::Horizontal)
        .constraints([Constraint::Percentage(30), Constraint::Percentage(70)].as_ref())
        .split(chunks[1]);

    // Sidebar
    let info_text = vec![
        Line::from(Span::styled("Current Module:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(app.state.current_module.as_str()),
        Line::from(""),
        Line::from(Span::styled("Exercise:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(app.state.current_exercise.as_str()),
        Line::from(""),
        Line::from(Span::styled("Status:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(app.status_msg.as_str()),
        Line::from(""),
        Line::from(Span::styled("AI Provider:", Style::default().add_modifier(Modifier::BOLD))),
        Line::from(app.config.active_provider.as_ref().map(|p| p.to_string()).unwrap_or("None".to_string())),
    ];
    let sidebar = Paragraph::new(info_text)
        .block(Block::default().title("Info").borders(Borders::ALL));
    f.render_widget(sidebar, main_chunks[0]);

    // Output
    let output = Paragraph::new(app.output.clone())
        .block(Block::default().title("Output").borders(Borders::ALL))
        .wrap(Wrap { trim: true })
        .scroll((app.scroll, 0));
    f.render_widget(output, main_chunks[1]);

    // Bottom Bar
    let help_text = match app.mode {
        UiMode::Normal => "q: Quit | r: Run | n: Next | g: Generate | e: Explain | v: Review",
        UiMode::InputTopic => "Enter: Generate | Esc: Cancel",
        UiMode::InputApiKey => "Enter: Save Key | Esc: Cancel",
        UiMode::SelectProvider => "Up/Down: Select | Enter: Confirm | Esc: Cancel",
        UiMode::ViewingMarkdown => "Esc/q: Close | j/k: Scroll",
        UiMode::Generating => "Working... Please wait. (Esc to cancel)",
    };
    let help = Paragraph::new(help_text)
        .style(Style::default().fg(Color::Yellow))
        .block(Block::default().borders(Borders::ALL));
    f.render_widget(help, chunks[2]);

    // Popups
    if app.mode != UiMode::Normal {
        let block = Block::default().borders(Borders::ALL).style(Style::default().bg(Color::Black));
        let area = centered_rect(60, 40, f.size()); // Slightly larger for review
        f.render_widget(Clear, area);
        f.render_widget(block, area);

        match app.mode {
            UiMode::InputTopic => {
                let text = vec![
                    Line::from("Enter a topic for the new exercise:"),
                    Line::from(""),
                    Line::from(Span::styled(&app.input_buffer, Style::default().fg(Color::Cyan))),
                ];
                let p = Paragraph::new(text)
                    .block(Block::default().borders(Borders::ALL).title("Generate Exercise"));
                f.render_widget(p, area);
            },
            UiMode::InputApiKey => {
                 let text = vec![
                    Line::from(format!("Enter API Key for {}:", app.config.active_provider.as_ref().unwrap())),
                    Line::from(""),
                    Line::from(Span::styled(&app.input_buffer, Style::default().fg(Color::Cyan))),
                ];
                let p = Paragraph::new(text)
                    .block(Block::default().borders(Borders::ALL).title("Configuration"));
                f.render_widget(p, area);
            },
            UiMode::SelectProvider => {
                let items = vec![ListItem::new("OpenAI"), ListItem::new("Gemini"), ListItem::new("Grok")];
                let list = List::new(items)
                    .block(Block::default().borders(Borders::ALL).title("Select AI Provider"))
                    .highlight_style(Style::default().add_modifier(Modifier::BOLD).fg(Color::Green))
                    .highlight_symbol(">> ");
                f.render_stateful_widget(list, area, &mut app.provider_list_state.clone());
            },
            UiMode::Generating => {
                 let spinners = ["|", "/", "-", "\\"];
                 let text = vec![
                    Line::from("AI is thinking..."),
                    Line::from(""),
                    Line::from(format!("Please wait {}", spinners[app.spinner_frame])),
                ];
                let p = Paragraph::new(text)
                    .block(Block::default().borders(Borders::ALL).title("Working"));
                f.render_widget(p, area);
            },
            UiMode::ViewingMarkdown => {
                let p = Paragraph::new(app.markdown_content.clone())
                    .block(Block::default().borders(Borders::ALL).title("AI Response"))
                    .wrap(Wrap { trim: true })
                    .scroll((app.markdown_scroll, 0));
                 f.render_widget(p, area);
            },
            _ => {}
        }
    }
}

fn centered_rect(percent_x: u16, percent_y: u16, r: Rect) -> Rect {
    let popup_layout = Layout::default()
        .direction(Direction::Vertical)
        .constraints(
            [
                Constraint::Percentage((100 - percent_y) / 2),
                Constraint::Percentage(percent_y),
                Constraint::Percentage((100 - percent_y) / 2),
            ]
            .as_ref(),
        )
        .split(r);

    Layout::default()
        .direction(Direction::Horizontal)
        .constraints(
            [
                Constraint::Percentage((100 - percent_x) / 2),
                Constraint::Percentage(percent_x),
                Constraint::Percentage((100 - percent_x) / 2),
            ]
            .as_ref(),
        )
        .split(popup_layout[1])[1]
}
