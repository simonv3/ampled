import './post.scss';

import cx from 'classnames';
import * as React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { routePaths } from '../../../route-paths';
import { UserRoles } from '../../../shared/user-roles';
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
import { PostForm } from '../post-form/PostForm';
import { styles } from './post-style';

import { deletePost } from '../../../../api/post/delete-post';

const sortItemsByCreationDate = (items) =>
  items.sort((a, b) => b.created_at - a.created_at);

const Comments = ({
  post,
  classes,
  expanded,
  handleDeleteComment,
  handleExpandClick,
  handleSubmit,
  canLoggedUserDeleteComment,
  isUserSubscribed,
}) => {
  const allComments = sortItemsByCreationDate(post.comments);
  const firstComments = allComments.slice(0, 2).reverse();
  const hasPreviousComments = allComments.length > 2;
  const hasComments = allComments.length > 0;

  return (
    <div className="comments-list">
      {hasComments && <span className="comments-list__header">Comments</span>}
      {!expanded &&
        firstComments.map((comment) => (
          <Comment
            key={comment.id}
            comment={comment}
            canDelete={canLoggedUserDeleteComment(comment.user_id)}
            deleteComment={handleDeleteComment}
          />
        ))}
      {hasPreviousComments && (
        <div>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            {allComments.reverse().map((comment) => (
              <Comment
                key={comment.id}
                comment={comment}
                canDelete={canLoggedUserDeleteComment(comment.user_id)}
                deleteComment={handleDeleteComment}
              />
            ))}
          </Collapse>
          <CardActions
            className={cx(classes.actions, 'collapse-actions')}
            disableSpacing
          >
            <button
              className="show-previous-command-btn"
              onClick={handleExpandClick}
            >
              <b>
                {expanded ? 'Hide Previous Comments' : 'View Previous Comments'}
              </b>
            </button>
          </CardActions>
        </div>
      )}
      {isUserSubscribed && (
        <CommentForm handleSubmit={handleSubmit} postId={post.id} />
      )}
    </div>
  );
};

Comments.propTypes = {
  post: PropTypes.any,
  expanded: PropTypes.bool,
  classes: PropTypes.any,
  handleDeleteComment: PropTypes.func,
  handleExpandClick: PropTypes.func,
  handleSubmit: PropTypes.func,
  canLoggedUserDeleteComment: PropTypes.func,
  isUserSubscribed: PropTypes.bool,
};

const Lock = ({ isLapsed = false, me, handlePrivatePostClick }) => {
  const authenticated = !!me;

  return (
    <div className="private-support">
      <div className="private-support__copy">
        {isLapsed ? 'Support On Hold' : 'Supporter Only'}
      </div>
      <div className="private-support__btn">
        {isLapsed ? (
          <Link to={routePaths.userDetails} className="btn btn-ampled">
            Update Payment Details
          </Link>
        ) : (
          <button
            className="btn btn-ampled"
            onClick={() => handlePrivatePostClick(authenticated)}
          >
            Support To Unlock
          </button>
        )}
      </div>
    </div>
  );
};

Lock.propTypes = {
  isLapsed: PropTypes.bool,
  handlePrivatePostClick: PropTypes.func,
  me: PropTypes.any,
};

const DeleteModal = ({ onCancel, onConfirm }) => (
  <div className="delete-post-modal__container">
    <img className="tear tear__topper" src={tear} alt="" />
    <div className="delete-post-modal">
      <div className="delete-post-modal__title">
        <h4>Are you sure?</h4>
      </div>
      <div className="delete-post-modal__actions action-buttons">
        <button className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button className="delete-button" onClick={onConfirm}>
          Delete Post
        </button>
      </div>
    </div>
  </div>
);

DeleteModal.propTypes = {
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

class PostComponent extends React.Component<any, any> {
  state = {
    showPrivatePostModal: false,
    showDeletePostModal: false,
    showEditPostModal: false,
    expanded: false,
  };

  handleExpandClick = () => {
    this.setState((state) => ({ expanded: !state.expanded }));
    setTimeout(() => {
      this.props.doReflow && this.props.doReflow();
    }, 500);
  };

  canLoggedUserPost = () => {
    return (
      this.props.loggedUserAccess &&
      (this.props.loggedUserAccess.role === UserRoles.Admin ||
        this.props.loggedUserAccess.role === UserRoles.Member ||
        this.props.loggedUserAccess.role === UserRoles.Owner)
    );
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

  openEditPostModal = () => {
    this.setState({ showEditPostModal: true });
  };

  closeEditPostModal = () => {
    this.setState({ showEditPostModal: false });
  };

  openSignupModal = () => {
    let artistId;

    if (this.props.match.params.slug) {
      artistId = this.props.artistId;
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
    const { history, artistId, artistSlug } = this.props;

    history.push(
      routePaths.support.replace(
        ':id',
        artistSlug && artistSlug.length > 0 ? artistSlug : artistId,
      ),
    );
  };

  handleSubmit = async (comment) => {
    await this.props.addComment(comment);
    this.props.updateArtist();
  };

  isUserSubscribed = () => {
    const { loggedUserAccess } = this.props;

    return (
      loggedUserAccess &&
      [
        UserRoles.Supporter.toString(),
        UserRoles.Owner.toString(),
        UserRoles.Admin.toString(),
        UserRoles.Member.toString(),
      ].includes(loggedUserAccess.role)
    );
  };

  canLoggedUserDeleteComment = (commentUserId: number) => {
    const { loggedUserAccess, me } = this.props;

    return (
      (loggedUserAccess &&
        (loggedUserAccess.role === UserRoles.Owner ||
          loggedUserAccess.role === UserRoles.Admin ||
          loggedUserAccess.role === UserRoles.Member)) ||
      (me && commentUserId === me.id)
    );
  };

  canLoggedUserEditPost = (postUserId: number) => {
    const { loggedUserAccess, me } = this.props;

    return (
      (loggedUserAccess &&
        (loggedUserAccess.role === UserRoles.Owner ||
          loggedUserAccess.role === UserRoles.Admin)) ||
      (me && postUserId === me.id)
    );
  };

  handleDeleteComment = async (commentId) => {
    await this.props.deleteComment(commentId);
    this.closeDeletePostModal();
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
  };

  returnFirstName = (name) => {
    const spacePosition = name.indexOf(' ');
    if (spacePosition === -1) {
      return name;
    } else {
      return name.substr(0, spacePosition);
    }
  };

  renderCloudinaryPhoto = (image: string, crop: number) => {
    const crop_url_path = `w_${crop},h_${crop},c_fill`;
    if (image) {
      if (image.includes('https://res.cloudinary')) {
        const img_src = image.replace('upload/', `upload/${crop_url_path}/`);
        return img_src;
      } else {
        const img_src = `https://res.cloudinary.com/ampled-web/image/fetch/${crop_url_path}/${image}`;
        return img_src;
      }
    }
  };

  render = () => {
    const { classes, post, accentColor, me } = this.props;

    const deny_details_lapsed = post.deny_details_lapsed || false;

    const allowDetails = post.allow_details;
    const isPrivate = post.is_private;
    const authenticated = !!me;

    return (
      <div>
        <div className="post">
          <Modal
            open={this.state.showDeletePostModal}
            onClose={this.closeDeletePostModal}
          >
            <DeleteModal
              onCancel={this.closeDeletePostModal}
              onConfirm={this.handleDeletePost}
            />
          </Modal>
          <Modal
            open={this.state.showEditPostModal}
            onClose={this.closeEditPostModal}
          >
            <PostForm
              close={this.closeEditPostModal}
              discardChanges={this.closeEditPostModal}
              isEdit
              post={post}
            />
          </Modal>
          <div
            className={cx('post', { 'clickable-post': !allowDetails })}
            onClick={() =>
              !deny_details_lapsed && this.handlePrivatePostClick(authenticated)
            }
            title={!allowDetails ? 'SUBSCRIBER-ONLY CONTENT' : ''}
          >
            <Card
              className={classes.card}
              style={{ border: `2px solid ${accentColor}` }}
            >
              <div className="post__header">
                <div className={classes.postTitle}>
                  {post.authorImage ? (
                    <img
                      className="user-image"
                      src={post.authorImage}
                      alt={`${this.returnFirstName(post.author)}'s avatar`}
                    />
                  ) : (
                    <img className="user-image" src={avatar} alt="Avatar" />
                  )}
                  <span className="post__header_name">
                    {this.returnFirstName(post.author)}
                  </span>
                </div>
                <div className={classes.postDate}>
                  {post.created_ago === 'less than a minute' ? (
                    <div className={classes.postDate}>Just Now</div>
                  ) : (
                    <div className={classes.postDate}>
                      {post.created_ago} ago
                    </div>
                  )}
                </div>
              </div>
              <Divider />

              {this.canLoggedUserPost() &&
                (isPrivate ? (
                  <div className="post__status">
                    <FontAwesomeIcon className="unlock" icon={faUnlock} />
                    Supporters Only
                  </div>
                ) : (
                  <div className="post__status">Public Post</div>
                ))}

              {this.isUserSubscribed() &&
                ![
                  UserRoles.Owner.toString(),
                  UserRoles.Admin.toString(),
                  UserRoles.Member.toString(),
                ].includes(this.props.loggedUserAccess.role) &&
                isPrivate && (
                  <div className="post__status">
                    <FontAwesomeIcon className="unlock" icon={faUnlock} />
                    Supporters Only
                  </div>
                )}

              {this.canLoggedUserEditPost(post.authorId) && (
                <div className="post__change">
                  <div className="post__change_edit">
                    <button onClick={this.openEditPostModal}>
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

              {post.image_url && !post.has_audio && (
                <div className="post__image-container">
                  <CardMedia
                    className={cx(classes.media, {
                      'blur-image': !allowDetails,
                    })}
                    image={this.renderCloudinaryPhoto(post.image_url, 500)}
                  />
                  {!allowDetails && (
                    <Lock
                      isLapsed={deny_details_lapsed}
                      me={this.props.me}
                      handlePrivatePostClick={this.handlePrivatePostClick}
                    />
                  )}
                </div>
              )}

              {post.has_audio && (
                <div className="post__audio-container">
                  <div className="post__image-container">
                    {post.image_url && (
                      <CardMedia
                        className={cx(classes.media, {
                          'blur-image': !allowDetails,
                        })}
                        image={this.renderCloudinaryPhoto(post.image_url, 500)}
                      />
                    )}
                    {!post.image_url && !allowDetails && (
                      <div
                        style={{
                          height: '340px',
                          background:
                            'radial-gradient(circle, rgba(79,79,83,1) 0%, rgba(126,126,126,1) 35%, rgba(219,233,236,1) 100%)',
                        }}
                      />
                    )}
                    {!allowDetails && (
                      <Lock
                        isLapsed={deny_details_lapsed}
                        me={this.props.me}
                        handlePrivatePostClick={this.handlePrivatePostClick}
                      />
                    )}
                  </div>
                  {allowDetails && (
                    <AudioPlayer
                      url={this.returnPlayableUrl()}
                      image={this.renderCloudinaryPhoto(post.image_url, 500)}
                      accentColor={accentColor}
                      callback={this.props.playerCallback}
                    />
                  )}
                </div>
              )}

              {!post.has_audio && !post.image_url && !allowDetails && (
                <div className="post__image-container">
                  <div
                    style={{
                      height: '340px',
                      background:
                        'radial-gradient(circle, rgba(79,79,83,1) 0%, rgba(126,126,126,1) 35%, rgba(219,233,236,1) 100%)',
                    }}
                  />
                  {
                    <Lock
                      isLapsed={deny_details_lapsed}
                      me={this.props.me}
                      handlePrivatePostClick={this.handlePrivatePostClick}
                    />
                  }
                </div>
              )}

              <div className="post__title">{post.title}</div>

              {post.body && (
                <div className="post__body">
                  <Linkify
                    componentDecorator={(
                      decoratedHref: string,
                      decoratedText: string,
                      key: number,
                    ) => (
                      <a
                        href={decoratedHref}
                        key={key}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {decoratedText}
                      </a>
                    )}
                  >
                    {post.body}
                  </Linkify>
                </div>
              )}
            </Card>
          </div>
          <Comments
            post={this.props.post}
            expanded={this.state.expanded}
            classes={this.props.classes}
            handleDeleteComment={this.handleDeleteComment}
            handleExpandClick={this.handleExpandClick}
            handleSubmit={this.handleSubmit}
            canLoggedUserDeleteComment={this.canLoggedUserDeleteComment}
            isUserSubscribed={this.isUserSubscribed()}
          />
        </div>
      </div>
    );
  };
}

const Post = withStyles(styles)(withRouter(PostComponent));

export { Post };
