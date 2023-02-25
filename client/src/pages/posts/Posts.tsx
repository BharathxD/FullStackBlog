import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import classes from "./Posts.module.css";
import Post from "./components/Post";

interface Props {
  isLoggedIn: boolean;
}

interface postsData {
  id: string;
  content: string;
  cover: string;
  summary: string;
  title: string;
  createdAt: string;
}

const Posts: React.FC<Props> = ({ isLoggedIn }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<postsData[] | null>(null);
  useEffect(() => {
    if (isLoggedIn === false) navigate("/");
  }, [isLoggedIn]);
  useEffect(() => {
    const fetchPosts = async () => {
      setData(null);
      const response = await fetch("http://localhost:3000/api/posts", {
        method: "GET",
      });
      const fetchedData = await response.json();
      let loadedPosts: postsData[] = Object.entries(fetchedData).map(
        ([id, { title, summary, content, cover, createdAt }]: any) => ({
          id,
          title,
          summary,
          content,
          cover,
          createdAt
        })
      );
      console.log(loadedPosts)
      setData(loadedPosts);
      console.log(fetchedData);
    };
    fetchPosts();
  }, []);
  return (
    <main className={classes.entries}>
      {data &&
        data.map((post: postsData) => {
          return (
            <Post
              key={post.id}
              title={post.title}
              summary={post.summary}
              content={post.content}
              cover={post.cover}
            />
          );
        })}
    </main>
  );
};

export default Posts;
