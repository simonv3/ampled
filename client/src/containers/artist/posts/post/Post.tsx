import './post.scss';

import cx from 'classnames';
import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { routePaths } from 'src/containers/route-paths';
import { UserRoles } from 'src/containers/shared/user-roles';
import { config } from '../../../../config';

import avatar from '../../../../images/ampled_avatar.svg';
import tear from '../../../../images/background_tear.png';
import { faUnlock, faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CardActions, Collapse, Divider } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import { withStyles } from '@material-ui/core/styles';
import { Modal } from '../../../shared/modal/Modal';
import { AudioPlayer } from '../../../shared/audio-player/AudioPlayer';
import Linkify from 'react-linkify';

import { Comment } from '../comments/Comment';
import { CommentForm } from '../comments/CommentForm';
import { styles } from './post-style';

import { deletePost } from 'src/api/post/delete-post';

class PostComponent extends React.Component<any, any> {
  state = {
    showPrivatePostModal: false,
    showDeletePostModal: false,
    expanded: false,
  };

  handleExpandClick = () => {
    this.setState((state) => ({ expanded: !state.expanded }));
    setTimeout(() => {
      this.props.doReflow && this.props.doReflow();
    }, 500);
  };

  canLoggedUserPost = () => {
    return this.props.loggedUserAccess && this.props.loggedUserAccess.role === UserRoles.Owner;
  };

  openPrivatePostModal = () => {
    this.setState({ showPrivatePostModal: true });
  };

  closePrivatePostModal = () => {
    this.setState({ showPrivatePostModal: false });
  };

  openDeletePostModal = () => {
    this.setState({ showDeletePostModal: true });
  };

  closeDeletePostModal = () => {
    this.setState({ showDeletePostModal: false });
  };

  openSignupModal = () => {
    let artistId;

    if (this.props.match.params.slug) {
      artistId = this.props.artist.id;
    } else {
      artistId = this.props.match.params.id;
    }

    this.props.openAuthModal({
      modalPage: 'signup',
      showSupportMessage: 'post',
      artistName: this.props.artistName,
      redirectTo: routePaths.support.replace(':id', artistId),
    });
  };

  redirectToSupport = () => {
    const { history, artistId } = this.props;

    history.push(routePaths.support.replace(':id', artistId));
  };

  sortItemsByCreationDate(items) {
    return items.sort((a, b) => b.created_at - a.created_at);
  }

  handleSubmit = async (comment) => {
    await this.props.addComment(comment);
    this.props.updateArtist();
  };

  isUserSubscribed = () => {
    const { loggedUserAccess } = this.props;

    return (
      loggedUserAccess && [UserRoles.Supporter.toString(), UserRoles.Owner.toString()].includes(loggedUserAccess.role)
    );
  };

  canLoggedUserDeleteComment = (commentUserId: number) => {
    const { loggedUserAccess, me } = this.props;

    return (loggedUserAccess && loggedUserAccess.role === UserRoles.Owner) || (me && commentUserId === me.id);
  };

  handleDeleteComment = async (commentId) => {
    await this.props.deleteComment(commentId);
    this.props.updateArtist();
  };

  handleDeletePost = async () => {
    await deletePost(this.props.post.id);
    this.props.updateArtist();
  };

  handlePrivatePostClick = (authenticated: boolean) => {
    if (this.props.post.allow_details) {
      return;
    } else if (!authenticated) {
      this.openSignupModal();
    } else {
      this.redirectToSupport();
    }
  };

  returnPlayableUrl = () => {
    const { post } = this.props;
    const playableUrl = `${config.aws.playableBaseUrl}${post.audio_file}`;
    return playableUrl;
  }

  returnFirstName = (name) => {
    let spacePosition = name.indexOf(' ');
    if (spacePosition === -1) {
      return name;
    } else {
      return name.substr(0, spacePosition);
    }
  };

  renderDeleteModal = () => (
    <div>
      <img className="tear__topper" src={tear} />
      <div className="delete-post-modal">
        <div className="delete-post-modal__title">
          <h4>Are you sure?</h4>
        </div>
        <div className="delete-post-modal__actions action-buttons">
          <button className="cancel-button" onClick={this.closeDeletePostModal}>
            Cancel
          </button>
          <button className="delete-button" onClick={this.handleDeletePost}>
            Delete Post
          </button>
        </div>
      </div>
    </div>
  );

  renderLock = () => {
    const { me } = this.props;
    const authenticated = !!me;

    return (
      <div className="private-support">
        <div className="private-support__copy">Supporter Only</div>
        <div className="private-support__btn">
          <button className="btn btn-ampled" onClick={() => this.handlePrivatePostClick(authenticated)}>
            SUPPORT TO UNLOCK
          </button>
        </div>
      </div>
    )
  };

  renderPost = () => {
    const { classes, post, accentColor, me } = this.props;

    const allowDetails = post.allow_details;
    const isPrivate = post.is_private;
    const authenticated = !!me;

    return (
      <div className="post">
        <Modal open={this.state.showDeletePostModal} onClose={this.closeDeletePostModal}>
          {this.renderDeleteModal()}
        </Modal>
        <div
          className={cx('post', { 'clickable-post': !allowDetails })}
          onClick={() => this.handlePrivatePostClick(authenticated)}
          title={!allowDetails ? 'SUBSCRIBER-ONLY CONTENT' : ''}
        >
          <Card className={classes.card} style={{ border: `2px solid ${accentColor}` }}>
            <div className="post__header">
              <div className={classes.postTitle}>
                {post.authorImage ? (
                  <img className="user-image" src={post.authorImage} />
                ) : (
                    <img className="user-image" src={avatar} />
                  )}
                <span className="post__header_name">{this.returnFirstName(post.author)}</span>
              </div>
              <div className={classes.postDate}>
                {post.created_ago === 'less than a minute' ? (
                  <div className={classes.postDate}>Just Now</div>
                ) : (
                    <div className={classes.postDate}>{post.created_ago} ago</div>
                  )}
              </div>
            </div>
            <Divider />

            {this.canLoggedUserPost() &&
              (isPrivate ? (
                <div className="post__status"><FontAwesomeIcon className="unlock" icon={faUnlock} />Subscribers Only</div>
              ) : (
                  <div className="post__status">Public Post</div>
                )
              )}

            {this.isUserSubscribed() && ![UserRoles.Owner.toString()].includes(this.props.loggedUserAccess.role) && isPrivate && (
              <div className="post__status"><FontAwesomeIcon className="unlock" icon={faUnlock} />Subscribers Only</div>
            )}

            {this.canLoggedUserPost() && (
              <div className="post__change">
                <div className="post__change_edit">
                  <button className="disabled">
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                </div>
                <div className="post__change_delete">
                  <button onClick={this.openDeletePostModal}>
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
              </div>
            )}

            {post.image_url && !post.audio_file && (
              <div className="post__image-container">
                <CardMedia className={cx(classes.media, { 'blur-image': !allowDetails })} image={post.image_url} />
                {!allowDetails && this.renderLock()}
              </div>
            )}

            {post.audio_file && (
              <div className="post__audio-container">
                {post.image_url && (
                  <div className="post__image-container">
                    <CardMedia className={cx(classes.media, { 'blur-image': !allowDetails })} image={post.image_url} />
                    {!allowDetails && this.renderLock()}
                  </div>
                )}
                <AudioPlayer
                  url={this.returnPlayableUrl()}
                  image={post.image_url}
                  accentColor={accentColor}
                />
              </div>
            )}

            <div className="post__title">
              {post.title}
            </div>

            {post.body && (
              <div className="post__body">
                <Linkify
                  componentDecorator={
                    (decoratedHref: string, decoratedText: string, key: number) =>
                      (<a href={decoratedHref} key={key} target="_blank">
                        {decoratedText}
                      </a>)
                  }
                >
                  {post.body}
                </Linkify>
              </div>
            )}
          </Card>
        </div>
        {this.renderComments()}
      </div>
    );
  };

  renderComments = () => {
    const { classes, post } = this.props;
    const { expanded } = this.state;

    const allComments = this.sortItemsByCreationDate(post.comments);
    const firstComments = allComments.slice(0, 2).reverse();
    const hasPreviousComments = allComments.length > 2;
    const hasComments = allComments.length > 0;

    return (
      <div className="comments-list">
        {hasComments && (
          <span className="comments-list__header">Comments</span>
        )}
        {!expanded &&
          firstComments.map((comment) => (
            <Comment
              key={comment.id}
              comment={comment}
              canDelete={this.canLoggedUserDeleteComment(comment.user_id)}
              deleteComment={this.handleDeleteComment}
            />
          ))}
        {hasPreviousComments && (
          <div>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              {allComments.reverse().map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  canDelete={this.canLoggedUserDeleteComment(comment.user_id)}
                  deleteComment={this.handleDeleteComment}
                />
              ))}
            </Collapse>
            <CardActions className={cx(classes.actions, 'collapse-actions')} disableSpacing>
              <button className="show-previous-command-btn" onClick={this.handleExpandClick}>
                <b>{expanded ? 'Hide Previous Comments' : 'View Previous Comments'}</b>
              </button>
            </CardActions>
          </div>
        )}
        {this.isUserSubscribed() && <CommentForm handleSubmit={this.handleSubmit} postId={post.id} />}
      </div>
    );
  };

  render() {
    return <div>{this.renderPost()}</div>;
  }
}

const Post = withStyles(styles)(withRouter(PostComponent));

export { Post };
