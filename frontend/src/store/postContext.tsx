// store/postContext.tsx
import React, { createContext, useContext } from 'react';

interface Post {
  text: string;
  image?: string | null;
  location?: string;
}

interface PostContextType {
  createPost: (post: Post) => Promise<void>;
}

const PostContext = createContext<PostContextType>({
  createPost: async () => {},
});

export const PostProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const createPost = async (post: Post) => {
    console.log('Post submitted:', post); // Placeholder
    // You'll replace this with API call logic once backend is ready
  };

  return (
    <PostContext.Provider value={{ createPost }}>
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => useContext(PostContext);
