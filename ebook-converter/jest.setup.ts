// Jest setup: configure environment variables used by the app
process.env.REDIS_URL = "redis://localhost:6379";
process.env.UPLOAD_DIR = "/tmp/ebook-uploads-test";
process.env.MAX_FILE_SIZE_MB = "10";
process.env.CALIBRE_PATH = "ebook-convert";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
