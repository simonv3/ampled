import './artist.scss';

import * as React from 'react';
import { ReactSVG } from 'react-svg';

import Edit from '../../images/icons/Icon_Edit.svg';
import Plus from '../../images/icons/Icon_Add-Plus.svg';
import { Button } from '@material-ui/core';
import { ArtistModel } from '../../redux/artists/initial-state';
import { UserRoles } from '../shared/user-roles';

import { FeaturedImages } from './header/FeaturedImages';
import { FeaturedVideo } from './header/FeaturedVideo';
import { FeaturedMessage } from './header/FeaturedMessage';
import { Supporters } from './header/Supporters';
import { ArtistInfo } from './header/ArtistInfo';

interface Props {
  openVideoModal: React.MouseEventHandler;
  openPostModal: React.MouseEventHandler;
  openWhyModal: React.MouseEventHandler;
  openMessageModal: React.MouseEventHandler;
  artist: ArtistModel;
  loggedUserAccess: { role: string; artistId: number };
  isSupporter: boolean;
  handleSupportClick: Function;
}

export class ArtistHeader extends React.Component<Props, any> {
  state = {
    showConfirmationDialog: false,
  };

  canLoggedUserPost = () => {
    return (
      this.props.loggedUserAccess &&
      (this.props.loggedUserAccess.role === UserRoles.Admin ||
        this.props.loggedUserAccess.role === UserRoles.Member ||
        this.props.loggedUserAccess.role === UserRoles.Owner)
    );
  };

  canLoggedUserAdmin = () => {
    return (
      this.props.loggedUserAccess &&
      (this.props.loggedUserAccess.role === UserRoles.Admin ||
        this.props.loggedUserAccess.role === UserRoles.Owner)
    );
  };

  renderArtistName = () => (
    <div className="artist-header__title">
      <span className="artist-header__title_flair"></span>
      {this.props.artist.name}
    </div>
  );

  renderSupportButton = () => {
    const { artist } = this.props;
    const borderColor = artist.accent_color;

    return (
      <div
        className="artist-header__message_container"
        style={{ border: 'unset', minHeight: 'auto' }}
      >
        <button
          className="btn btn-ampled btn-support"
          style={{ borderColor, maxWidth: '100%' }}
          onClick={() => this.props.handleSupportClick()}
        >
          Support What You Want
        </button>
        <button onClick={this.props.openWhyModal} className="link link__why">
          Why support?
        </button>
      </div>
    );
  };

  renderFloatingNewPostButton = () =>
    this.canLoggedUserPost() && (
      <div className="new-post">
        <Button
          onClick={this.props.openPostModal}
          endIcon={<ReactSVG className="icon icon_white" src={Plus} />}
          size="small"
        >
          New Post
        </Button>
      </div>
    );

  renderFloatingEditButton = () =>
    this.canLoggedUserAdmin() && (
      <div className="edit-page">
        <Button
          onClick={() => {
            window.location.href = `${window.location.pathname}/edit`;
          }}
          endIcon={<ReactSVG className="icon icon_white" src={Edit} />}
          size="small"
        >
          Edit Page
        </Button>
      </div>
    );

  render() {
    return (
      <>
        <div className="container">{this.renderArtistName()}</div>
        <div className="artist-header container">
          <FeaturedImages
            artist={this.props.artist}
            loggedUserAccess={this.props.loggedUserAccess}
            isSupporter={this.props.isSupporter}
            handleSupportClick={this.props.handleSupportClick}
            imageWidth={800}
            imageHeight={800}
          />
          <div className="artist-header__message-col">
            <FeaturedVideo
              artist={this.props.artist}
              openVideoModal={this.props.openVideoModal}
            />
            <FeaturedMessage
              artist={this.props.artist}
              openMessageModal={this.props.openMessageModal}
            />
            <Supporters
              artist={this.props.artist}
              openWhyModal={this.props.openWhyModal}
              loggedUserAccess={this.props.loggedUserAccess}
              isSupporter={this.props.isSupporter}
              handleSupportClick={this.props.handleSupportClick}
            />

            {!this.props.isSupporter &&
              !this.canLoggedUserPost() &&
              this.props.artist.isStripeSetup &&
              this.renderSupportButton()}
            {this.renderFloatingNewPostButton()}
            {this.renderFloatingEditButton()}
          </div>
        </div>
        <ArtistInfo
          location={this.props.artist.location}
          accentColor={this.props.artist.accent_color}
          twitterHandle={this.props.artist.twitter_handle}
          instagramHandle={this.props.artist.instagram_handle}
          bandcampHandle={this.props.artist.bandcamp_handle}
          youtubeHandle={this.props.artist.youtube_handle}
          external={this.props.artist.external}
        />
      </>
    );
  }
}
