const express = require("express");
const { PrismaClient } = require("@prisma/client");

const app = express();
const router = express.Router();

const prisma = new PrismaClient();

const connectToDB = async () => {
  try {
    await prisma.$connect();
    console.log("Success connect");
  } catch (error) {
    console.log(`Bir Hata Oluştu! ${error}`);
  }
};

const disconnectToDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("Success disconnect");
  } catch (error) {
    console.log(`Bir Hata Oluştu! ${error}`);
  }
};

prisma.$on("beforeExit", async () => {
  console.log("beforeExit hook");
  // PrismaClient still available
  //   await prisma.message.create({
  //     data: {
  //       message: "Shutting down server",
  //     },
  //   });
});

const createUser = async () => {
  prisma.user
    .create({
      data: {
        email: "test@mail.com",
        name: "name",
        age: 24,
        birthDate: new Date(),
      },
    })
    .then((res) => {
      console.log(res);
    })
    .catch((e) => {
      console.log("An error occured when user created", e);
    });
};

const createMultipleUser = async () => {
  prisma.user
    .createMany({
      data: [
        { name: "Bob", email: "bob@mail.com", age: 20, birthDate: new Date() },
        { name: "Bobo", email: "bob@mail.com", age: 20, birthDate: new Date() }, // Duplicate unique key!
        {
          name: "Yewange",
          email: "yewade@mail.com",
          age: 20,
          birthDate: new Date(),
        },
        {
          name: "Angelique",
          email: "angelique@mail.com",
          age: 20,
          birthDate: new Date(),
        },
      ],
      skipDuplicates: true, // Skip "Bobo"
    })
    .then((res) => {
      console.log(res);
    })
    .catch((e) => {
      console.log("An error occured when user created", e);
    });
};

router.get("/", (req, res) => {
  res.json("Hello from prisma");
  // createUser();
  createMultipleUser();
});

app.use(express.json());
app.use(router);

app.listen(3001, async () => {
  console.log("Server is running on port => 3001");
  connectToDB();
});
