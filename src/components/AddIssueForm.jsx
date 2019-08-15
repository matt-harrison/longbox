import React from 'react';

class AddIssueForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contributors: this.props.issue.contributors
    };
  };

  addContributor = () => {
    let contributors = this.state.contributors;

    contributors.push({
      creator: '',
      creator_type: '',
      id: null
    });

    this.setState({
      contributors
    });
  };

  render() {
    const contributors = this.state.contributors ? this.state.contributors.map((contributor, index) => {
      return (
        <div key={index} className="flex mb10 ml10">
          <div className="mr10 w100">
            <label htmlFor={`creatorType${index}`}>type</label>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id={`creatorType${index}`}
            name={`creatorType${index}`}
            value={contributor.creator_type}
            onChange={event => {this.props.handleContributorTextChange(event, index, contributor, 'creator_type')}}
            />
          </div>
          <div className="wFull">
            <label htmlFor={`creator${index}`}>name</label>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id={`creator${index}`}
            name={`creator${index}`}
            value={contributor.creator}
            onChange={event => {this.props.handleContributorTextChange(event, index, contributor, 'creator')}}
            />
          </div>
        </div>
      );
    }) : '';

    return (
      <form
      className="bdrBox mb5 bdrBlack p10"
      id="issue"
      onSubmit={this.props.addIssue}
      >
        <div className="flex spaceBetween">
          <h2 className="mb10 bold">
            {this.props.issue.title}
            {this.props.issue.number && ` #${this.props.issue.number}`}
          </h2>
          <span onClick={this.props.handleClose} className="bold csrPointer">X</span>
        </div>
        <div className="flex spaceBetween mb10">
          <div className="flex">
            <input
            checked={this.props.issue.is_read}
            className="mr5 bdrBlack p5"
            id="is_read"
            name="is_read"
            onChange={this.props.handleIssueCheckboxChange}
            type="checkbox"
            />
            <label htmlFor="is_read">read</label>
          </div>
          <div className="flex">
            <input
            checked={this.props.issue.is_owned}
            className="mr5 bdrBlack p5"
            id="is_owned"
            name="is_owned"
            onChange={this.props.handleIssueCheckboxChange}
            type="checkbox"
            />
            <label htmlFor="is_owned">owned</label>
          </div>
          <div className="flex">
            <input
            checked={this.props.issue.is_color}
            className="mr5 bdrBlack p5"
            id="is_color"
            name="is_color"
            onChange={this.props.handleIssueCheckboxChange}
            type="checkbox"
            />
            <label htmlFor="is_color">color</label>
          </div>
        </div>
        <div className="flex mb10">
          <div className="mr10 wFull">
            <label htmlFor="title">title</label>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id="title"
            name="title"
            onChange={this.props.handleIssueTextChange}
            value={this.props.issue.title}
            />
          </div>
          <div className="w100">
            <label htmlFor="number">number</label>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id="number"
            name="number"
            onChange={this.props.handleIssueTextChange}
            value={this.props.issue.number || ''}
            />
          </div>
        </div>
        <div className="mb10 wFull">
          <label htmlFor="sort_title">sort title</label>
          <input
          className="bdrBox bdrBlack p5 wFull"
          id="sort_title"
          name="sort_title"
          onChange={this.props.handleIssueTextChange}
          value={this.props.issue.sort_title}
          />
        </div>
        <div className="mb10">
          <label htmlFor="publisher">publisher</label>
          <input
          className="bdrBox bdrBlack p5 wFull"
          id="publisher"
          name="publisher"
          onChange={this.props.handleIssueTextChange}
          value={this.props.issue.publisher || ''}
          />
        </div>
        <div className="mb10">
          <label htmlFor="year">year</label>
          <input
          className="bdrBox bdrBlack p5 wFull"
          id="year"
          name="year"
          onChange={this.props.handleIssueTextChange}
          value={this.props.issue.year || ''}
          />
        </div>
        <div className="mb10">
          <label htmlFor="format">format</label>
          <input
          className="bdrBox bdrBlack p5 wFull"
          id="format"
          name="format"
          onChange={this.props.handleIssueTextChange}
          value={this.props.issue.format}
          />
        </div>
        <div className="mb10">
          <label htmlFor="notes">notes</label>
          <textarea
          className="bdrBox bdrBlack p5 wFull"
          id="notes"
          name="notes"
          onChange={this.props.handleIssueTextChange}
          value={this.props.issue.notes}
          />
        </div>
        <div id="contributors">
          <label>contributors</label>
          {contributors}
          <i aria-hidden={true} className={`ml10 fs14 fas fa-plus csrPointer`} onClick={this.addContributor}></i>
        </div>
        {this.props.user.isAdmin && (
          <div className="flex flexEnd mt10">
            <button
            className="bdrBlack p5 csrPointer"
            type="submit"
            >
              add issue(s)
            </button>
          </div>
        )}
      </form>
    );
  }
}

export default AddIssueForm;
