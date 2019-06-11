import './footer.scss';

import * as React from 'react';
import { Link } from 'react-router-dom';

import logo from '../../images/ampled_logo.svg';

interface Props {
  bgColor: string;
}

class Footer extends React.Component<Props,any> {

  render() {
    return (
      <footer className="footer" style={{ backgroundColor: this.props.bgColor }}>
        <div className="container">
          <div className="row">
            <div className="col-12 col-md-4">
              <div className="title">Join Our Mailing List</div>
              <div className="input-group mb-3">
                <input type="text" className="form-control" placeholder="Email Address" aria-label="" aria-describedby="" />
                <div className="input-group-append">
                  <button className="btn btn__dark" type="button" id="button-addon">
                    Gimme &rarr;
                  </button>
                </div>
              </div>
            </div>
            <div className="col-6 col-md-2">
              <div className="title">Get Started</div>
              <a href="https://www.ampled.com/what-is-ampled">What is Ampled?</a>
              <a href="#">Create An Artist Page</a>
              <a href="https://www.ampled.com/our-mission">Our Mission</a>
              <a href="https://www.ampled.com/who-we-are">Who We Are</a>
              <a href="https://www.ampled.com/about">Learn More About Us</a>
            </div>
            <div className="col-6 col-md-2">
              <div className="title">Get Involved</div>
              <a href="https://www.ampled.com/artist-ownership">Artist Ownership</a>
              <a href="https://www.ampled.com/jobs">Jobs</a>
              <a href="https://www.ampled.com/press">Press</a>
            </div>
            <div className="col-6 col-md-2">
              <div className="title">Get Informed</div>
              <a href="https://www.ampled.com/artist-ownership">Transparency Dash</a>
              <a href="https://www.ampled.com/faq">FAQs</a>
              <a href="https://www.ampled.com/terms-of-use">Terms of Use</a>
              <a href="https://www.ampled.com/privacy-policy">Privacy Policy</a>
              <a href="https://www.ampled.com/zine">Blog</a>
              <a href="https://www.ampled.com/contact-us">Contact</a>
            </div>
            <div className="col-6 col-md-2">
              <Link to="/">
                <img src={logo} alt="logo" className="logo" />
              </Link>
              <div className="copyright">©2018 Ampled</div>
            </div>
          </div>
        </div>
      </footer>
    );
  }
}

export { Footer };
