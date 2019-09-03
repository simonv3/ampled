import './user-settings.scss';

import { DateTime } from 'luxon';
import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { closeAuthModalAction, openAuthModalAction } from 'src/redux/authentication/authentication-modal';
import { Store } from 'src/redux/configure-store';
import { getMeAction } from 'src/redux/me/get-me';
import { setUserDataAction } from 'src/redux/me/set-me';
import { updateMeAction } from 'src/redux/me/update-me';
import { cancelSubscriptionAction } from 'src/redux/subscriptions/cancel';

import { faEdit, faMapMarkerAlt } from '@fortawesome/free-solid-svg-icons';
import { faTwitter, faInstagram, faStripe } from '@fortawesome/free-brands-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import tear from '../../images/background_tear.png';
import tear_black from '../../images/background_tear_black.png';

import avatar from '../../images/ampled_avatar.svg';

import { initialState as loginInitialState } from '../../redux/authentication/initial-state';
import { initialState as meInitialState } from '../../redux/me/initial-state';
import { initialState as subscriptionsInitialState } from '../../redux/subscriptions/initial-state';
import { routePaths } from '../route-paths';
import { Modal } from '../shared/modal/Modal';
import { Loading } from '../shared/loading/Loading';
import { showToastMessage, MessageType } from '../shared/toast/toast';

type Dispatchers = ReturnType<typeof mapDispatchToProps>;

type Props = typeof loginInitialState &
  typeof meInitialState &
  Dispatchers & { history: any; subscriptions: typeof subscriptionsInitialState };

class UserSettingsComponent extends React.Component<Props, any> {
  state = {
    showCancelModal: false,
    subscription: undefined,
  };

  componentDidMount() {
    this.props.getMe();
  }

  componentDidUpdate() {
    if (this.props.token && !this.props.error && !this.props.userData && !this.props.loadingMe) {
      this.props.getMe();
    }

    if (this.props.subscriptions.cancelled && !this.props.loadingMe) {
      this.showCancelledSuccessMessage();
      this.props.getMe();
    }
  }

  showCancelledSuccessMessage = () => {
    const artistPageLink = routePaths.support.replace(':id', this.props.subscriptions.artistPageId.toString());

    showToastMessage(
      `We are sad to see you leaving. Remember that you can always support <a href="${artistPageLink}">${
        this.props.subscriptions.artistName
      }</a> with a different value!`,
      MessageType.SUCCESS,
    );
  };

  getFormattedDate = (date: string) => {
    if (!date) {
      return '-';
    }

    return DateTime.fromString(date.split('T')[0], 'yyyy-MM-dd').toLocaleString(DateTime.DATE_MED);
  };

  openCancelModal = (event, subscription) => {
    event.preventDefault();

    this.setState({ showCancelModal: true, subscription });
  };

  closeCancelModal = () => this.setState({ showCancelModal: false, subscription: undefined });

  cancelSubscription = () => {
    this.props.cancelSubscription({
      subscriptionId: this.state.subscription.subscriptionId,
      artistPageId: this.state.subscription.artistPageId,
      artistName: this.state.subscription.name,
    });
    this.closeCancelModal();
  };

  formatMoney = (value) => {
    if (isNaN(value)) {
      return 0;
    }

    return value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };

  calculateSupportTotal = (supportLevel) =>
    this.calculateSupportTotalNumber(supportLevel).toFixed(2)

  calculateSupportTotalNumber = (supportLevel) => (Math.round((supportLevel * 100 + 30) / .971) / 100);
  
  redirectToArtistPage = (pageId) => {
    this.props.history.push(routePaths.artists.replace(':id', pageId));
  };

  renderUserImage = () => {
    const { userData } = this.props;

    return (
      <div className="user-image-container">
        <a href="/user-details">
          {userData.image ? (
            <img src={userData.image} className="user-image" />
          ) : (
            <img src={avatar} className="user-image" />
          )}
        </a>
      </div>
    );
  };

  renderUserInfo = () => {
    const { userData } = this.props;
    // const { subscriptions } = userData;
    // let monthlyTotal = 0;
    // if (subscriptions && subscriptions.length) {
    //   for (const sub of subscriptions) {
    //     monthlyTotal += this.calculateSupportTotalNumber(sub.amount / 100);
    //   }
    // }
    return (
      <div className="user-info-container col-md-3">
        <img className="tear__topper" src={tear} />
        <div className="user-content">
          {this.renderUserImage()}
          <div className="user-content__name">{userData.name}</div>
          <div className="user-content__joined-at">Joined {this.getFormattedDate(userData.created_at)}</div>
          { userData.city && (
            <div className="user-content__city"><FontAwesomeIcon className="icon" icon={faMapMarkerAlt} /> {userData.city}</div>
          )}
          { userData.bio && (
            <div>
              <div className="user-content__hr"></div>
              <div className="user-content__bio">{userData.bio}</div>
              <div className="user-content__hr"></div>
            </div>
          )}
          {console.log(userData)}
          { userData.twitter && (
              <div className="user-content__social"><FontAwesomeIcon className="icon" icon={faTwitter} /> {userData.twitter}</div>
          )}
          { userData.instagram && (
              <div className="user-content__social"><FontAwesomeIcon className="icon" icon={faInstagram} /> {userData.instagram}</div>
          )}
          {/*
            monthlyTotal > 0 ?
              (<p className="user-name">${monthlyTotal.toFixed(2)}/Month</p>) :
              ''
          */}
          
          <a href="/user-details" className="user-content__edit-profile">
            <FontAwesomeIcon icon={faEdit} /> Edit Profile
          </a>
        </div>
      </div>
    );
  };

  renderPagesTitle = (title: string) => <h1>{title}</h1>;

  renderCancelSubscriptionModal = () => {
    if (!this.state.subscription) {
      return null;
    }

    return (
      <Modal open={this.state.showCancelModal} onClose={this.closeCancelModal}>
        <div className="user-settings-cancel-modal">
          <p>Are you sure you want to stop supporting {this.state.subscription.name}?</p>
          <div className="action-buttons">
            <button className="cancel-button" onClick={this.closeCancelModal}>
              Of Course Not!
            </button>
            <button className="delete-button" onClick={this.cancelSubscription}>
              Yes
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  renderOwnedPages = () => (
    <div>
      {this.renderPagesTitle('MY ARTIST PAGES')}
      <div className="pages row no-gutters justify-content-center justify-content-md-start">
        {this.props.userData.ownedPages.map((ownedPage) => (
          <div key={`artist-${ownedPage.id}`} className="artist col-sm-4">
            <img className="artist__image" src={ownedPage.image} />
            <div className="artist__image-border" onClick={() => this.redirectToArtistPage(ownedPage.artistId)}></div>
            <img className="tear__topper" src={tear_black} />
            <div className="artist__info">
              <p className="artist__info_name" onClick={() => this.redirectToArtistPage(ownedPage.artistId)}>{ownedPage.name}</p>
              <div className="details">
                <div className="details__info">
                  <div className="row no-gutter">
                    <div className="col-6">
                      <div className="details__info_title">Supporters</div>
                      <div className="details__info_value">{ownedPage.supportersCount || 0}</div>
                    </div>
                    <div className="col-6">
                      <div className="details__info_title">Monthly Total</div>
                      <div className="details__info_value">$ {this.formatMoney(ownedPage.monthlyTotal / 100)}</div>
                    </div>
                  </div>
                  <div className="row no-gutter">
                    <div className="col-6">
                      <div className="details__info_title">Last Post</div>
                      <div className="details__info_value">{this.getFormattedDate(ownedPage.lastPost)}</div>
                    </div>
                    <div className="col-6">
                      <div className="details__info_title">Last Payout</div>
                      <div className="details__info_value">{this.getFormattedDate(ownedPage.lastPayout)}</div>
                    </div>
                  </div>
                </div>
                <div className="details__stripe">
                  <div className="row no-gutter align-items-center">
                    <div className="col-4">
                      <FontAwesomeIcon className="icon details__stripe_icon" icon={faStripe} />
                    </div>
                    <div className="col-8">
                      <a href={ownedPage.stripeSignup ? ownedPage.stripeSignup : ownedPage.stripeDashboard} className="details__stripe_link" target="_blank">Edit Payout Details</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  renderSupportedArtists = () => (
    <div>
      {this.renderPagesTitle('SUPPORTED ARTISTS')}
      <div className="pages row no-gutters justify-content-center justify-content-md-start">
        {this.props.userData.subscriptions.map((subscription) => (
          <div key={`artist-${subscription.artistPageId}`} className="artist col-sm-4">
            <img className="artist__image" src={subscription.image} />
            <div className="artist__image-border" onClick={() => this.redirectToArtistPage(subscription.artistPageId)}></div>
            <img className="tear__topper" src={tear_black} />
            <div className="artist__info">
              <p className="artist__info_name" onClick={() => this.redirectToArtistPage(subscription.artistPageId)}>{subscription.name}</p>
              <div className="details">
                <div className="details__info">
                  <div className="row no-gutter">
                    <div className="col-8">
                      <div className="details__info_title">Supporting At</div>
                      <div className="details__info_value details__info_value_large">${subscription.amount / 100}/Month</div>
                      <div className="details__info_value details__info_value_small">${this.calculateSupportTotal(subscription.amount / 100)} incl. fees</div>
                    </div>
                    <div className="col-4">
                      <a className="details__info_value details__info_value_cancel" onClick={(event) => this.openCancelModal(event, subscription)}>
                        Cancel
                      </a>
                    </div>
                  </div>
                  <div className="row no-gutter">
                    <div className="col-6">
                      <div className="details__info_title">Support Date</div>
                      <div className="details__info_value">{this.getFormattedDate(subscription.support_date)}</div>
                    </div>
                    <div className="col-6">
                      <div className="details__info_title">Last Post</div>
                      <div className="details__info_value">{this.getFormattedDate(subscription.last_post_date)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  renderEmptyArtists = () => (
    <div>
      {this.renderPagesTitle('SUPPORTED ARTISTS')}
      <div className="pages row no-gutters justify-content-center justify-content-md-start">
        <div className="center col-md-8">You currently don't support any artists.</div>
      </div>
    </div>
  );

  renderContent = () => (
    <div className="row content">
      {this.renderUserInfo()}
      <div className="pages-container col-md-9">
        { this.props.userData.ownedPages.length > 0 ?
          this.renderOwnedPages() : '' }
        { this.props.userData.subscriptions.length > 0 ?
          this.renderSupportedArtists() : this.renderEmptyArtists() }
      </div>
    </div>
  );


  render() {
    const { userData } = this.props;

    return (
      <div className="container user-settings-container">
        <Loading
          artistLoading={this.props.loadingMe} 
        />
        {userData && this.renderContent()}
        {this.renderCancelSubscriptionModal()}
      </div>
    );
  }
}

const mapStateToProps = (state: Store) => ({
  ...state.authentication,
  ...state.me,
  subscriptions: state.subscriptions,
});

const mapDispatchToProps = (dispatch) => ({
  getMe: bindActionCreators(getMeAction, dispatch),
  setMe: bindActionCreators(setUserDataAction, dispatch),
  openAuthModal: bindActionCreators(openAuthModalAction, dispatch),
  closeAuthModal: bindActionCreators(closeAuthModalAction, dispatch),
  cancelSubscription: bindActionCreators(cancelSubscriptionAction, dispatch),
  updateMe: bindActionCreators(updateMeAction, dispatch),
});

const UserSettings = connect(
  mapStateToProps,
  mapDispatchToProps,
)(UserSettingsComponent);

export { UserSettings };
