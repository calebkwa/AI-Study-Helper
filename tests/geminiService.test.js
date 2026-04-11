jest.mock("../src/geminiService");

const generateNotes = require("../src/geminiService");

describe("Gemini Service", () => {
  it("returns a summary string", async () => {
    generateNotes.mockResolvedValue("Mock summary");

    const result = await generateNotes("test notes");

    expect(result).toBe("Mock summary");
    expect(typeof result).toBe("string");
  });
});