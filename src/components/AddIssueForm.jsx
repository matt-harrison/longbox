import React from 'react';

class AddIssueForm extends React.Component {
  render() {
    return (
      <form
      className="bdrBox mb5 bdrBlack p10"
      id="issue"
      onSubmit={this.props.addIssue}
      >
        <div className="flex spaceBetween alignCenter mb10">
          <h2 className="bold">
            {this.props.issue.title}
            {this.props.issue.numbers && ` #${this.props.issue.numbers}`}
          </h2>
          <i aria-hidden={true} className="fas fa-times-circle pointer" onClick={this.props.handleClose}></i>
        </div>
        {this.props.errors.length > 0 && (
          <ul className="errors mb10 txtRed">
            {this.props.errors.map(error => (
              <li>{error}</li>
            ))}
          </ul>
        )}
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
            onBlur={this.props.handleInputBlur}
            onChange={this.props.handleIssueTextChange}
            onFocus={this.props.handleIssueTextChange}
            onKeyDown={this.props.handleInputKeyDown}
            value={this.props.issue.title}
            />
          </div>
          <div className="w100">
            <label htmlFor="numbers">number(s)</label>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id="numbers"
            name="numbers"
            onBlur={this.props.handleInputBlur}
            onChange={this.props.handleIssueTextChange}
            onFocus={this.props.handleIssueTextChange}
            value={this.props.issue.numbers || ''}
            />
          </div>
        </div>
        <div className="mb10 wFull">
          <label htmlFor="sort_title">sort title</label>
          <input
          className="bdrBox bdrBlack p5 wFull"
          id="sort_title"
          name="sort_title"
          onBlur={this.props.handleInputBlur}
          onChange={this.props.handleIssueTextChange}
          onFocus={this.props.handleIssueTextChange}
          value={this.props.issue.sort_title}
          />
        </div>
        <div className="mb10">
          <label htmlFor="publisher">publisher</label>
          <input
          className="bdrBox bdrBlack p5 wFull"
          id="publisher"
          name="publisher"
          onBlur={this.props.handleInputBlur}
          onChange={this.props.handleIssueTextChange}
          onFocus={this.props.handleIssueTextChange}
          onKeyDown={this.props.handleInputKeyDown}
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
          onBlur={this.props.handleInputBlur}
          onChange={this.props.handleIssueTextChange}
          onFocus={this.props.handleIssueTextChange}
          onKeyDown={this.props.handleInputKeyDown}
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
          {this.props.issue.contributors ? this.props.issue.contributors.map((contributor, index) => {
            return (
              <div key={index} className="flex mb10 ml10">
                <div className="mr10 w100">
                  <label htmlFor={`creator_type${index}`}>type</label>
                  <input
                  className="bdrBox bdrBlack p5 wFull"
                  data-contributor-id={contributor.id}
                  data-contributor-index={index}
                  data-contributor-key="creator_type"
                  id={`creator_type${index}`}
                  name={`creator_type${index}`}
                  onBlur={this.props.handleInputBlur}
                  onChange={this.props.handleContributorTextChange}
                  onFocus={this.props.handleContributorTextChange}
                  onKeyDown={this.props.handleInputKeyDown}
                  value={contributor.creator_type}
                  />
                </div>
                <div className="wFull">
                  <label htmlFor={`creator${index}`}>name</label>
                  <input
                  className="bdrBox bdrBlack p5 wFull"
                  data-contributor-id={contributor.id}
                  data-contributor-index={index}
                  data-contributor-key="creator"
                  id={`creator${index}`}
                  name={`creator${index}`}
                  onBlur={this.props.handleInputBlur}
                  onChange={this.props.handleContributorTextChange}
                  onFocus={this.props.handleContributorTextChange}
                  onKeyDown={this.props.handleInputKeyDown}
                  value={contributor.creator}
                  />
                </div>
              </div>
            );
          }) : null}
          <i aria-hidden={true} className={`ml10 fs14 fas fa-plus pointer`} onClick={this.props.addContributor}></i>
        </div>
        {this.props.user.isAdmin && (
          <div className="flex flexEnd mt10">
            <button
            className="bdrBlack p5 pointer"
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
