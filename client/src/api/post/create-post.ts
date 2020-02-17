import { apiAxios } from '../setup-axios';

interface Post {
  title: string;
  body: string;
  audio_file: string;
  image_url: string;
  artist_page_id: string;
  is_private: boolean;
}

export const createPost = async (post: Post) => {
  const {
    title,
    body,
    audio_file,
    image_url,
    artist_page_id,
    is_private,
  } = post;

  const { data } = await apiAxios({
    method: 'post',
    url: `/artist_pages/${artist_page_id}/posts.json`,
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      post: {
        title,
        body,
        audio_file,
        image_url,
        artist_page_id,
        is_private,
      },
    },
  });

  return { data };
};
