import './artist-header.scss';

import * as React from 'react';
import { MuiThemeProvider, withStyles } from '@material-ui/core/styles';
import { IconButton } from '@material-ui/core/';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import tear from '../../../images/paper_header.png';

import { theme } from './theme';

interface Props {
  artist: any;
  openVideoModal: any;
}

export class FeaturedVideo extends React.Component<Props, any> {
  renderVideoContainer = () => {
    const { artist } = this.props;

    const PlayButton = withStyles({
      root: {
        color: 'inherit',
        backgroundColor: 'inherit',
        '&:hover': {
          backgroundColor: 'inherit',
        },
      },
    })(IconButton);

    if (artist.video_url) {
      return (
        <MuiThemeProvider theme={theme}>
          <div
            className="artist-header__message_container"
            style={{ borderColor: artist.accent_color }}
          >
            <PlayButton
              onClick={this.props.openVideoModal}
              className="artist-header__play"
              aria-label="Play video message"
            >
              <FontAwesomeIcon
                className="artist-header__play_svg"
                icon={faPlay}
              />
            </PlayButton>
            <div className="artist-header__message_video">
              <img className="artist-header__message_tear" src={tear} alt="" />
              <div className="artist-header__message_image_container">
                <img
                  className="artist-header__message_image"
                  src={artist.video_screenshot_url}
                  alt="Video message thumbnail"
                />
              </div>
            </div>
          </div>
        </MuiThemeProvider>
      );
    }
  };

  render() {
    return <div>{this.renderVideoContainer()}</div>;
  }
}
