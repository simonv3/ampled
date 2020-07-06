import * as React from 'react';

import { apiAxios } from '../../api/setup-axios';
import { Loading } from '../shared/loading/Loading';

interface PostsProps {
  match: {
    params: {
      slug: string;
    };
  };
}

class BlogPosts extends React.Component<PostsProps, any> {
  state = {
    content: '',
    title: '',
    excerpt: '',
    loading: true,
  };

  componentDidMount = () => {
    this.loadPosts();
  };

  loadPosts = async () => {
    this.setState({ loading: true });
    const { data } = await apiAxios({
      method: 'get',
      url: `http://cms.ampled.com/wp-json/wp/v2/posts/`,
    });

    data.map(
      (post) =>
        post.slug === this.props.match.params.slug &&
        this.setState({
          loading: false,
          title: post.title.rendered,
          content: post.content.rendered,
          excerpt: post.excerpt.rendered,
        }),
    );
  };

  render() {
    if (this.state.loading) {
      return <Loading artistLoading={true} />;
    }
    return (
      <div className="page-container">
        <h1 className="post__title">{this.state.title}</h1>
        <div
          className="post__content"
          dangerouslySetInnerHTML={{ __html: this.state.content }}
        ></div>
      </div>
    );
  }
}

export { BlogPosts };
