import { faArrowDown, faHeart, faShare, faUserCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Divider } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import CardMedia from '@material-ui/core/CardMedia';
import Collapse from '@material-ui/core/Collapse';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import * as React from 'react';
import './post.scss';

const styles = (theme) => ({
  card: {
    maxWidth: 500,
    borderRadius: 0,
    boxShadow: 'none',
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9
  },
  actions: {
    display: 'flex',
  },
  expand: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandOpen: {
    transform: 'rotate(180deg)',
  },
});

class PostComponent extends React.Component<any, any> {
  state = { expanded: false };

  handleExpandClick = () => {
    this.setState((state) => ({ expanded: !state.expanded }));
  };

  render() {
    const { classes, post, accentColor } = this.props;

    return (
      <Card className={classes.card} style={{ border: `2px solid ${accentColor}` }}>
        <CardHeader
          avatar={<FontAwesomeIcon className="user-image" icon={faUserCircle} />}
          action={`${post.created_ago} ago`}
          title={post.author}
        />
        <Divider />
        <CardMedia
          className={classes.media}
          image="https://res.cloudinary.com/ampled-web/image/upload/v1543080694/sample.jpg"
        />
        <CardContent>
          <Typography component="p">{post.title}</Typography>
        </CardContent>
        <CardActions className={classes.actions} disableActionSpacing>
          <IconButton aria-label="Like" disabled>
            <FontAwesomeIcon icon={faHeart} />
          </IconButton>
          <IconButton aria-label="Share" disabled>
            <FontAwesomeIcon icon={faShare} />
          </IconButton>
          <IconButton
            className={classnames(classes.expand, {
              [classes.expandOpen]: this.state.expanded,
            })}
            onClick={this.handleExpandClick}
            aria-expanded={this.state.expanded}
            aria-label="View more"
          >
            <FontAwesomeIcon icon={faArrowDown} />
          </IconButton>
        </CardActions>
        <Collapse in={this.state.expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography paragraph>{post.body}</Typography>
          </CardContent>
        </Collapse>
      </Card>
    );
  }
}

const Post = withStyles(styles)(PostComponent);

export { Post };
