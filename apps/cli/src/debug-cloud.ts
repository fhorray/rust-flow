
async function test() {
  const url = "http://127.0.0.1:8787";
  const token = "test-token-123";

  console.log(`Target: ${url}`);

  try {
    const root = await fetch(url);
    console.log(`ROOT: ${root.status} ${await root.text()}`);
  } catch (e) {
    console.log(`ROOT FAILED: ${e.message}`);
  }

  try {
    const res = await fetch(`${url}/api/auth/get-session`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log(`SESSION: ${res.status} ${await res.text()}`);
  } catch (e) {
    console.log(`SESSION FAILED: ${e.message}`);
  }

  try {
    const res = await fetch(`${url}/api/progress/get?courseId=test-course`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    console.log(`PROGRESS: ${res.status} ${await res.text()}`);
  } catch (e) {
    console.log(`PROGRESS FAILED: ${e.message}`);
  }
}

test();
