import * as React from 'react';

import { apiAxios } from '../../api/setup-axios';
import { Loading } from '../shared/loading/Loading';
import { Link } from 'react-router-dom';

interface PostsProps {
  match: {
    params: {
      slug: string;
    };
  };
}

class BlogPosts extends React.Component<PostsProps, any> {
  state = {
    posts: [],
    loading: true,
    page: 1,
  };

  componentDidMount = () => {
    this.loadPosts(this.state.page);
  };

  nextPage = () => {
    this.loadPosts(+this.state.page + 1);
  };

  prevPage = () => {
    if (this.state.page === 1) {
      return;
    }
    this.loadPosts(+this.state.page - 1);
  };

  loadPosts = async (page) => {
    this.setState({ loading: true });
    const { data } = await apiAxios({
      method: 'get',
      url: `http://cms.ampled.com/wp-json/wp/v2/posts?page=${page}`,
    });

    this.setState({
      loading: false,
      posts: data,
    });
  };

  render() {
    if (this.state.loading) {
      return <Loading artistLoading={true} />;
    }
    return (
      <div className="container posts">
        <div className="row">
          {this.state.posts.map((post) => (
            <div className="col-md-6 posts__tease" key={post.id}>
              <Link to={`/blog/${post.id}`}>
                <h2 className="posts__title">{post.title.rendered}</h2>
              </Link>
              <div
                className="posts__excerpt"
                dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
              ></div>
            </div>
          ))}
        </div>

        {this.state.page > 1 && (
          <button onClick={this.prevPage} className="btn btn-ampled">
            Prev Page
          </button>
        )}
        {this.state.posts.length === 10 && (
          <button onClick={this.nextPage} className="btn btn-ampled">
            Next Page
          </button>
        )}
      </div>
    );
  }
}

export { BlogPosts };
