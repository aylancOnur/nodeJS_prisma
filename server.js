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

router.get("/", (req, res) => {
  res.json("Hello from prisma");
});

router.post("/user", async (req, res) => {
  const { email, name, postTitle, bio } = req.body;
  try {
    const createUser = await prisma.user.create({
      data: {
        email: email,
        name: name,
        posts: {
          create: { title: postTitle },
        },
        profile: {
          create: { bio: bio },
        },
      },
    });
    res.json(createUser);
  } catch (error) {
    res.status(500).json({ message: "Bir hata gerçekleşti!" });
    console.log("error =>", error);
  }
});

router.put("/update/:postId", async (req, res) => {
  const { postTitle } = req.body;
  const { postId } = req.params;
  try {
    const updatePost = await prisma.post.update({
      where: {
        id: Number(postId),
      },
      data: {
        title: postTitle,
      },
    });
    res.json(updatePost);
  } catch (error) {
    res.status(500).json({ message: "Bir hata gerçekleşti!" });
    console.log("error =>", error);
  }
});

router.get("/user", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Bir hata gerçekleşti!" });
    console.log("error =>", error);
  }
});

router.get("/allUsers", async (req, res) => {
  try {
    const allUsers = await prisma.user.findMany({
      include: {
        posts: true,
        profile: true,
      },
    });
    res.json(allUsers);
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

router.get("/paginated", async (req, res) => {
  const { start, end } = req.query
  try {
    const user = await prisma.post.findMany({
      skip: Number(start), // başlangıç sayfası
      take: Number(end),  // bitiş sayfası
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Bir hata gerçekleşti!" });
    console.log("error =>", error);
  }
});

router.post("/multiple", async (req, res) => {
  const { data } = req.body;
  console.log("dataaaaaaaaaaaaaaaaaaaaaaa", data);
  try {
    const multipleUser = await prisma.user.createMany({
      data: data,
      skipDuplicates: true, // Skip "Bobo"
    });
    res.json(multipleUser);
  } catch (error) {
    res.status(500).json({ message: "Bir hata gerçekleşti!" });
    console.log("error =>", error);
  }
});

router.get("/group", async (req, res) => {
  try {
    const users = await prisma.user.groupBy({
      by: ["name"],
    });
    res.json(users);
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
