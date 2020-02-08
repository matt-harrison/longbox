import React from 'react';

class EditIssueForm extends React.Component {
  render() {
    const contributors = this.props.issue.contributors ? this.props.issue.contributors.map((contributor, index) => {
      return (
        <div key={contributor.id} className="flex mb10 ml10">
          <div className="mr10 w100">
            <div className="flex">
              <label className="mr5" htmlFor={`creator_type${index}`}>type</label>
              <span>[{contributor.creator_type_id}]</span>
            </div>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id={`creator_type${index}`}
            name={`creator_type${index}`}
            value={contributor.creator_type}
            onBlur={this.props.handleContributorTextBlur}
            onChange={event => {this.props.handleContributorTextChange(event, index, contributor.id, 'creator_type')}}
            onFocus={event => {this.props.handleContributorTextChange(event, index, contributor.id, 'creator_type')}}
            />
          </div>
          <div className="wFull">
            <div className="flex">
              <label className="mr5" htmlFor={`creator${index}`}>name</label>
              <span>[{contributor.creator_id}]</span>
            </div>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id={`creator${index}`}
            name={`creator${index}`}
            value={contributor.creator}
            onBlur={this.props.handleContributorTextBlur}
            onChange={event => {this.props.handleContributorTextChange(event, index, contributor.id, 'creator')}}
            onFocus={event => {this.props.handleContributorTextChange(event, index, contributor.id, 'creator')}}
            />
          </div>
        </div>
      );
    }) : '';

    return (
      <form
      className="bdrBox mb5 bdrBlack p10"
      id="issue"
      onSubmit={this.props.updateIssue}
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
            <label htmlFor="is_read" className={`${this.props.issue.is_read === null ? 'txtRed' : ''}`}>read</label>
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
            <label htmlFor="is_owned" className={`${this.props.issue.is_owned === null ? 'txtRed' : ''}`}>owned</label>
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
            <label htmlFor="is_color" className={`${this.props.issue.is_color === null ? 'txtRed' : ''}`}>color</label>
          </div>
        </div>
        <div className="flex mb10">
          <div className="mr10 wFull">
            <div className="flex">
              <label className="mr5" htmlFor="title">title</label>
              <span>[{this.props.issue.title_id}]</span>
            </div>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id="title"
            name="title"
            onBlur={this.props.handleIssueTextBlur}
            onChange={this.props.handleIssueTextChange}
            onFocus={this.props.handleIssueTextChange}
            value={this.props.issue.title}
            />
          </div>
          <div className="mb10 w100">
            <label htmlFor="number">number</label>
            <input
            className="bdrBox bdrBlack p5 wFull"
            id="number"
            name="number"
            onBlur={this.props.handleIssueTextBlur}
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
          readOnly={true}
          value={this.props.issue.sort_title}
          />
        </div>
        <div className="mb10">
          <div className="flex">
            <label className="mr5" htmlFor="publisher">publisher</label>
            <span>[{this.props.issue.publisher_id}]</span>
          </div>
          <input
          className="bdrBox bdrBlack p5 wFull"
          id="publisher"
          name="publisher"
          onBlur={this.props.handleIssueTextBlur}
          onChange={this.props.handleIssueTextChange}
          onFocus={this.props.handleIssueTextChange}
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
          <div className="flex">
            <label className="mr5" htmlFor="format">format</label>
            <span>[{this.props.issue.format_id}]</span>
          </div>
          <input
          className="bdrBox bdrBlack p5 wFull"
          id="format"
          name="format"
          onBlur={this.props.handleIssueTextBlur}
          onChange={this.props.handleIssueTextChange}
          onFocus={this.props.handleIssueTextChange}
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
        <div>
          <label>contributors</label>
          {contributors}
          <i aria-hidden={true} className={`ml10 fs14 fas fa-plus csrPointer`} onClick={this.props.addContributor}></i>
        </div>
        {this.props.user.isAdmin && (
          <div className="flex flexEnd mt10">
            <button
            className="bdrBlack p5 csrPointer"
            type="submit"
            >
              update issue
            </button>
          </div>
        )}
      </form>
    );
  }
}

export default EditIssueForm;
