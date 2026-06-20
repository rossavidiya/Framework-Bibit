const { test, expect } = require('@playwright/test');
const baseURL = 'https://jsonplaceholder.typicode.com';

// ==========================================
// DEFINISI JSON SCHEMA
// ==========================================
const singlePostSchema = {
  type: "object",
  properties: {
    id: { type: "number" },
    title: { type: "string" },
    body: { type: "string" },
    userId: { type: "number" }
  },
  required: ["id", "title", "body", "userId"]
};

const arrayPostsSchema = {
  type: "array",
  items: singlePostSchema
};

const emptySchema = {
  type: "object",
  additionalProperties: false // JSONPlaceholder merespons "{}" untuk DELETE
};

function validateSinglePostSchema(body) {
  return body
    && typeof body === 'object'
    && !Array.isArray(body)
    && typeof body.id === 'number'
    && typeof body.title === 'string'
    && typeof body.body === 'string'
    && typeof body.userId === 'number';
}

function validateArrayPostsSchema(body) {
  return Array.isArray(body) && body.every(validateSinglePostSchema);
}

function validateEmptySchema(body) {
  return body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0;
}

// ==========================================
// TEST CASES
// ==========================================
test.describe('JSONPlaceholder API Testing Suite', () => {

  // 3. Create a New Post
  test('Create a New Post', async ({ request }) => {
    const payload = {
      title: "Learn API Testing",
      body: "Practicing API testing with JSONPlaceholder",
      userId: 101
    };

    const response = await request.post(`${baseURL}/posts`, { data: payload });
    expect(response.status()).toBe(201); // 201 Created

    const responseBody = await response.json();

    // Verifikasi data (Title, Body, UserId match)
    expect(responseBody.title).toBe(payload.title);
    expect(responseBody.body).toBe(payload.body);
    expect(responseBody.userId).toBe(payload.userId);

    // Validasi struktur response
    expect(validateSinglePostSchema(responseBody)).toBeTruthy();
  });

  // 4. Retrieve Posts
  test('Retrieve Posts', async ({ request }) => {
    const response = await request.get(`${baseURL}/posts`);
    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    // Verifikasi dengan loop function: id field is not null for all posts
    for (const post of responseBody) {
      expect(post.id).not.toBeNull();
      expect(post.id).toBeDefined();
    }

    // Validasi struktur response
    expect(validateArrayPostsSchema(responseBody)).toBeTruthy();
  });

  // 5. Delete a Post
  test('Delete a Post', async ({ request }) => {
    const response = await request.delete(`${baseURL}/posts/1`);
    
    // Konfirmasi HTTP status code (200 OK)
    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    // Verifikasi response body matches expected result (empty object)
    expect(responseBody).toEqual({});

    // Validasi struktur response
    expect(validateEmptySchema(responseBody)).toBeTruthy();
  });

  // 6. Update a Post
  test('Update a Post', async ({ request }) => {
    const payload = {
      id: 1,
      title: "Updated Post Title",
      body: "This is the updated body content.",
      userId: 99
    };

    const response = await request.put(`${baseURL}/posts/1`, { data: payload });
    expect(response.status()).toBe(200);

    const responseBody = await response.json();

    // Verifikasi data (Title, Body, UserId match)
    expect(responseBody.title).toBe(payload.title);
    expect(responseBody.body).toBe(payload.body);
    expect(responseBody.userId).toBe(payload.userId);

    // Validasi struktur response
    expect(validateSinglePostSchema(responseBody)).toBeTruthy();
  });

});



//jalankanskrip npx playwright test tests/Bibit/api.spec.js