const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");

const envPaths = [
  path.join(__dirname, "..", ".env"),
  path.join(__dirname, "..", "..", ".env"),
];
for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    require("dotenv").config({ path: envPath, quiet: true });
  }
}

const connectDB = require("../config/mongodb");
const User = require("../models/user.model");
const MemberProfile = require("../models/memberProfile.model");
const ChoirEvent = require("../models/event.model");
const Song = require("../models/song.model");
const Announcement = require("../models/annoucement.model");
const Setlist = require("../models/setlist.model");
const ChoirAssignment = require("../models/assignment.model");
const PracticeLog = require("../models/practiceLog.model");
const Notification = require("../models/notification.model");

const DEMO = {
  admin: {
    email: "demo.admin@harmoniq.app",
    password: "DemoAdmin2026!",
    name: "Demo Admin",
    role: "admin",
    voicePart: "Tenor",
  },
  members: [
    {
      email: "demo.member@harmoniq.app",
      password: "DemoMember2026!",
      name: "Sara Bekele",
      voicePart: "Soprano",
    },
    {
      email: "yohannes.demo@harmoniq.app",
      password: "DemoMember2026!",
      name: "Yohannes Tadesse",
      voicePart: "Tenor",
    },
    {
      email: "hanna.demo@harmoniq.app",
      password: "DemoMember2026!",
      name: "Hanna Girma",
      voicePart: "Alto",
    },
    {
      email: "daniel.demo@harmoniq.app",
      password: "DemoMember2026!",
      name: "Daniel Mekonnen",
      voicePart: "Bass",
    },
  ],
};

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function setTime(date, hours, minutes = 0) {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

async function upsertUser({ email, password, name, role, voicePart }) {
  const passwordHash = await bcrypt.hash(password, 10);
  let user = await User.findOne({ email });

  if (user) {
    user.name = name;
    user.role = role;
    user.voicePart = voicePart;
    user.passwordHash = passwordHash;
    user.isActive = true;
    user.isPasswordChanged = true;
    await user.save();
  } else {
    user = await User.create({
      name,
      email,
      role,
      voicePart,
      passwordHash,
      isActive: true,
      isPasswordChanged: true,
    });
    await MemberProfile.create({ user: user._id, joinedAt: user.createdAt });
  }

  const profile = await MemberProfile.findOne({ user: user._id });
  if (!profile) {
    await MemberProfile.create({ user: user._id, joinedAt: user.createdAt });
  }

  return user;
}

async function seedDemoData() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is not set. Configure .env before seeding.");
    process.exit(1);
  }

  await connectDB();

  // Remove legacy unique index if present (old schema had username)
  try {
    await User.collection.dropIndex("username_1");
    console.log("Removed legacy username index.");
  } catch {
    /* index may not exist */
  }

  const admin = await upsertUser(DEMO.admin);
  const members = [];
  for (const member of DEMO.members) {
    members.push(
      await upsertUser({
        ...member,
        role: "member",
      })
    );
  }

  const [sara, yohannes, hanna, daniel] = members;
  const existingEvents = await ChoirEvent.countDocuments({ createdBy: admin._id });

  if (existingEvents > 0) {
    console.log("Demo data already present. Updating user passwords only.");
    printCredentials();
    await disconnect();
    return;
  }

  const now = new Date();
  const rehearsalStart = setTime(addDays(now, 3), 18, 30);
  const rehearsalEnd = setTime(addDays(now, 3), 20, 30);
  const performanceStart = setTime(addDays(now, 10), 10, 0);
  const performanceEnd = setTime(addDays(now, 10), 12, 0);
  const outreachStart = setTime(addDays(now, 7), 15, 0);
  const outreachEnd = setTime(addDays(now, 7), 17, 0);

  const events = await ChoirEvent.insertMany([
    {
      title: "Thursday Rehearsal — Easter Set",
      description: "Focus on blend and dynamics for the upcoming service.",
      eventType: "rehearsal",
      location: "Main Sanctuary",
      startAt: rehearsalStart,
      endAt: rehearsalEnd,
      status: "scheduled",
      requiredVoiceParts: ["Soprano", "Alto", "Tenor", "Bass"],
      createdBy: admin._id,
      notes: "Arrive 15 minutes early for warm-up.",
    },
    {
      title: "Community Outreach Concert",
      description: "Outdoor performance for the neighborhood outreach program.",
      eventType: "outreach",
      location: "Church Courtyard",
      startAt: outreachStart,
      endAt: outreachEnd,
      status: "scheduled",
      requiredVoiceParts: ["Soprano", "Alto", "Tenor", "Bass"],
      createdBy: admin._id,
    },
    {
      title: "Sunday Service Performance",
      description: "Full choir set for the Easter Sunday service.",
      eventType: "performance",
      location: "Main Sanctuary",
      startAt: performanceStart,
      endAt: performanceEnd,
      status: "scheduled",
      requiredVoiceParts: ["Soprano", "Alto", "Tenor", "Bass"],
      createdBy: admin._id,
    },
  ]);

  const songs = await Song.insertMany([
    {
      title: "Betelehem",
      composer: "Traditional",
      arranger: "Choir Arrangement",
      category: "worship",
      difficulty: "intermediate",
      keySignature: "G",
      tempo: "Andante",
      tags: ["easter", "amharic", "worship"],
      isActive: true,
      addedBy: admin._id,
      performanceCount: 12,
    },
    {
      title: "How Great Thou Art",
      composer: "Carl Boberg",
      arranger: "HarmoniQ Choir",
      category: "hymn",
      difficulty: "beginner",
      keySignature: "C",
      tempo: "Moderato",
      tags: ["hymn", "english"],
      isActive: true,
      addedBy: admin._id,
      performanceCount: 8,
    },
    {
      title: "Meskel Flower",
      composer: "Traditional Ethiopian",
      category: "seasonal",
      difficulty: "advanced",
      keySignature: "D",
      tags: ["meskel", "seasonal"],
      isActive: true,
      addedBy: admin._id,
      performanceCount: 5,
    },
    {
      title: "Amazing Grace",
      composer: "John Newton",
      category: "hymn",
      difficulty: "beginner",
      keySignature: "F",
      tags: ["hymn", "classic"],
      isActive: true,
      addedBy: admin._id,
      performanceCount: 20,
    },
  ]);

  await Announcement.insertMany([
    {
      title: "Welcome to the HarmoniQ Demo",
      message:
        "This is a portfolio demo with sample members, songs, and events. Use the demo login on the sign-in page to explore as admin or member.",
      createdBy: admin._id,
      isActive: true,
    },
    {
      title: "Rehearsal dress code",
      message: "Please wear all black for Thursday rehearsal. Music folders will be provided at the door.",
      createdBy: admin._id,
      isActive: true,
    },
    {
      title: "New sheet music uploaded",
      message: "Easter set PDFs are available under Resources. Review the soprano line before rehearsal.",
      createdBy: admin._id,
      isActive: true,
    },
  ]);

  await Setlist.create({
    title: "Easter Sunday — Full Service",
    event: events[2]._id,
    description: "Approved set for the Easter performance.",
    status: "approved",
    preparedBy: admin._id,
    approvedBy: admin._id,
    approvedAt: now,
    items: [
      { order: 1, song: songs[0]._id, estimatedMinutes: 6, voicePartFocus: "Full" },
      { order: 2, song: songs[1]._id, estimatedMinutes: 5, voicePartFocus: "Full" },
      { order: 3, song: songs[3]._id, estimatedMinutes: 4, soloist: "Sara Bekele" },
    ],
  });

  await ChoirAssignment.create({
    leadSingers: [sara._id, yohannes._id],
    backupSingers: [hanna._id],
    prayerTeam: [daniel._id],
    assignedBy: admin._id,
  });

  await PracticeLog.insertMany([
    {
      member: sara._id,
      song: songs[0]._id,
      practicedAt: addDays(now, -1),
      durationMinutes: 45,
      focusArea: "blend",
      selfRating: 4,
      notes: "Worked on the bridge section with a friend.",
      voicePart: "Soprano",
      sharedWithDirector: true,
    },
    {
      member: sara._id,
      song: songs[1]._id,
      practicedAt: addDays(now, -3),
      durationMinutes: 30,
      focusArea: "memorization",
      selfRating: 3,
      voicePart: "Soprano",
    },
    {
      member: hanna._id,
      song: songs[2]._id,
      practicedAt: addDays(now, -2),
      durationMinutes: 60,
      focusArea: "pitch",
      selfRating: 5,
      notes: "Alto line feels solid now.",
      voicePart: "Alto",
      sharedWithDirector: true,
    },
  ]);

  await Notification.insertMany([
    {
      recipient: sara._id,
      title: "Rehearsal reminder",
      body: "Thursday Rehearsal — Easter Set starts in 3 days at Main Sanctuary.",
      category: "event",
      relatedId: events[0]._id,
      relatedModel: "ChoirEvent",
    },
    {
      recipient: sara._id,
      title: "New announcement",
      body: "Rehearsal dress code — please wear all black.",
      category: "announcement",
      isRead: false,
    },
    {
      recipient: admin._id,
      title: "Practice log shared",
      body: "Sara Bekele shared a practice log for Betelehem.",
      category: "system",
      isRead: true,
      readAt: now,
    },
  ]);

  console.log("Demo data seeded successfully.");
  printCredentials();
  await disconnect();
}

function printCredentials() {
  console.log("---");
  console.log("Demo credentials (also shown on the login page):");
  console.log(`Admin:  ${DEMO.admin.email} / ${DEMO.admin.password}`);
  console.log(`Member: ${DEMO.members[0].email} / ${DEMO.members[0].password}`);
  console.log("---");
}

async function disconnect() {
  const mongoose = require("mongoose");
  await mongoose.disconnect();
}

seedDemoData().catch((err) => {
  console.error("Demo seed failed:", err.message);
  process.exit(1);
});
