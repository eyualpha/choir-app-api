const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");

process.env.JWT_SECRET = "test-jwt-secret-key-minimum-32-characters";
process.env.EMAIL_USER = "test@example.com";
process.env.EMAIL_PASS = "test-password";
process.env.CLOUDINARY_NAME = "test-cloud";
process.env.CLOUDINARY_API_KEY = "test-key";
process.env.CLOUDINARY_API_SECRET = "test-secret";
process.env.NODE_ENV = "test";

jest.mock("../utils/sendEmail", () => ({
  sendEmail: jest.fn().mockResolvedValue(true),
  sendResetOtpEmail: jest.fn().mockResolvedValue(true),
  sendAssignmentEmail: jest.fn().mockResolvedValue(true),
}));

jest.mock("../config/cloudinary", () => {
  const { PassThrough } = require("stream");
  return {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((opts, cb) => {
        const stream = new PassThrough();
        stream.on("finish", () => {
          cb(null, {
            secure_url:
              "https://res.cloudinary.com/demo/image/upload/v1/test.jpg",
            public_id: "uploads/test",
          });
        });
        return stream;
      }),
      destroy: jest.fn().mockResolvedValue({ result: "ok" }),
    },
  };
});

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongoServer.getUri();
  await mongoose.connect(process.env.MONGODB_URI);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
