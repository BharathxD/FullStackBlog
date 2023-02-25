import { Request, Response } from "express";
import fs from "fs";
import {
  findPost,
  getPosts,
  updatePost,
  uploadPost,
} from "../services/post.service";
import { signJWT, verifyJWT } from "../utils/jwt.utils";
import logger from "../utils/logger";
import { findUser } from "../services/user.service";

export const postHandler = async (req: Request, res: Response) => {
  if (req.file && req.file.originalname) {
    const { originalname, path } = req.file;
    const parts = originalname.split(".");
    const extension = parts[parts.length - 1];
    res.json({ extension: extension });
    const newPath = path + "." + extension;
    fs.renameSync(path, newPath);
    const { token } = req.cookies;
    const user = verifyJWT(token);
    const authorID = (user.decoded as { _id: number })._id;
    const { title, summary, content } = req.body;
    await uploadPost({
      author: authorID,
      title: title,
      summary: summary,
      content: content,
      cover: newPath,
    });
  } else {
    res.send(409);
  }
};

export const getPostsHandler = async (req: Request, res: Response) => {
  try {
    const posts = await getPosts();
    res.status(200).send(posts);
  } catch (error: any) {
    logger.error(error);
    res.status(409).send({ message: error });
  }
};

export const findPostHandler = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const post = await findPost({ _id: postId });
    res.status(200).send(post);
  } catch (error: any) {
    res.status(409).send({ message: error });
  }
};

export const editPostHandler = async (req: Request, res: Response) => {
  try {
    let newPath = null;
    if (req.file) {
      const { originalname, path } = req.file;
      const parts = originalname.split(".");
      const ext = parts[parts.length - 1];
      newPath = path + "." + ext;
      fs.renameSync(path, newPath);
    }
    const { token } = req.cookies;
    const user = verifyJWT(token);
    if (!user) {
      throw new Error("User is not authenticated");
    }
    const userId = (user.decoded as { _id: string })._id;
    const requestedPost = await findPost({author: userId})
    if (!requestedPost) {
      throw new Error("The user is not authenticated to do this operation")
    }
    const { postId } = req.params;
    const update = req.body;
    const updatedPost = await updatePost({ _id: postId }, update);
    res.status(200).send(updatedPost);
  } catch (error: any) {
    res.status(409).send({ message: error.message });
  }
};
