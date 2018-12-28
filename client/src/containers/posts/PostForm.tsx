import * as React from 'react';
import { Upload } from './Upload';

class PostForm extends React.Component<any, any> {
  constructor(props) {
    super(props);

    this.state = {
      title: '',
      caption: '',
      audioUrl: '',
      artist_page_id: this.props.match.params.id,
    };
  }

  handleChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleSubmit = (event) => {
    event.preventDefault();
    alert(`Form submitted: ${this.state}`);
  };

  addAudioUrl(audioUrl) {
    this.setState({ audioUrl });
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Post title:
          <input name="title" type="text" value={this.state.title} onChange={this.handleChange} />
        </label>
        <label>
          Caption:
          <textarea name="caption" value={this.state.caption} onChange={this.handleChange} />
        </label>
        <input type="hidden" value={this.state.audioUrl} name="audioUrl" />
        <Upload onComplete={this.addAudioUrl.bind(this)} />
        <input type="submit" value="Submit" />
      </form>
    );
  }
}

export { PostForm };
