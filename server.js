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
  // createMultipleUser();
});

router.get("/user", async (req, res) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  res.json(user);
});

router.get("/group", async (req, res) => {
  const users = await prisma.user.groupBy({
    by: ["name"],
  });
  res.json(users);
});

router.patch("/user", async (req, res) => {
  const { name, email } = req.body;
  try {
    const updateUser = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        name: name,
      },
    });
    res.json(updateUser);
  } catch (error) {
    res.status(500).json({ message: "Bir hata gerçekleşti!" });
    console.log("error =>", error);
  }
});

router.delete("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const deleteUser = await prisma.user.delete({
      where: {
        id: Number(userId),
      },
    });
    res.json(deleteUser);
  } catch (error) {
    res.status(500).json({ message: "Bir hata gerçekleşti!" });
    console.log("error =>", error);
  }
});

app.use(express.json());
app.use(router);

app.listen(3001, async () => {
  console.log("Server is running on port => 3001");
  connectToDB();
});
