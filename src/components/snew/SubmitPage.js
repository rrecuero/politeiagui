import React from "react";
import ReactBody from "react-body";
import connector from "../../connectors/submitProposal";
import MarkdownEditorField from "../Form/Fields/MarkdownEditorField";
import FilesField from "../Form/Fields/FilesField";
import ErrorField from "../Form/Fields/ErrorField";
import Message from "../Message";
import MultipleItemsBodyMessage from "../MultipleItemsBodyMessage";
import ProposalInfo from "../ProposalInfo";
import { isArray, isUndefined, concat, cloneDeep } from "lodash";
import { Field } from "redux-form";

const normalizer = (value, previousValue) => {
  let files = [];

  if (previousValue && isArray(previousValue)) {
    files = cloneDeep(previousValue);
  }

  // Delete images
  if (!isUndefined(value.remove)) {
    files.splice(value.remove, 1);
  }

  // Add images
  if (isArray(value)) {
    files = concat(files, value);
  }

  return files;
};

class SubmitPage extends React.Component {
  render() {
    const {
      isLoading,
      PageLoadingIcon,
      policy,
      error,
      onSave,
      handleSubmit,
      newProposalError,
      userCanExecuteActions
    } = this.props;
    return !policy || isLoading ? <PageLoadingIcon /> : (
      <div className="content" role="main">
        <div className="page submit-proposal-page">
          <ReactBody className="submit-page" />
          <div
            className="submit content warn-on-unload"
            id="newlink"
          >
            <Message type="info" header="Important information about proposals">
              <ProposalInfo policy={policy} />
            </Message>
            <div className="formtabs-content">
              <div className="spacer">
                <Field
                  name="global"
                  component={props => <ErrorField title="Cannot submit proposal" {...props} />}
                />
                <div className="roundfield" id="title-field">
                  <div className="roundfield-content">
                    <Field
                      name="name"
                      component="textarea"
                      tabIndex={1}
                      type="text"
                      placeholder="Proposal Name"
                    />
                    <input name="kind" type="hidden" defaultValue="self" />
                    <div className="usertext">
                      <input name="thing_id" type="hidden" defaultValue />
                      <div className="usertext-edit md-container" style={{}}>
                        <div className="md">
                          <Field
                            name="description"
                            component={MarkdownEditorField}
                            tabIndex={2}
                            placeholder="Markdown Entry"
                            rows={20}
                            cols={80}
                          />
                          <Field
                            name="files"
                            component={FilesField}
                            userCanExecuteActions={userCanExecuteActions}
                            placeholder="Attach files"
                            policy={policy}
                            normalize={normalizer}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="spacer">
                <button
                  className={`btn togglebutton access-required${!userCanExecuteActions ? " not-active disabled" : ""}`}
                  name="submit"
                  type="submit"
                  value="form"
                  onClick={handleSubmit(onSave)}>
                  submit
                </button>
                {newProposalError && (
                  <Message type="error" header="Error creating proposal">
                    <MultipleItemsBodyMessage items={newProposalError} />
                  </Message>
                )}
                {error && (
                  <Message type="error" header="Error creating proposal">
                    <MultipleItemsBodyMessage items={error} />
                  </Message>
                )}
              </div>
              <div className="spacer">
                <div className="roundfield">
                  <div className="markhelp" >
                    <p>
                      We use a slightly-customized version of{" "}
                      <a href="http://daringfireball.net/projects/markdown/syntax">
                        Markdown
                      </a>{" "}
                      for formatting. See below for some basics
                    </p>
                    <table className="md">
                      <tbody>
                        <tr
                          style={{
                            backgroundColor: "#ffff99",
                            textAlign: "center"
                          }}
                        >
                          <td>
                            <em>you type:</em>
                          </td>
                          <td>
                            <em>you see:</em>
                          </td>
                        </tr>
                        <tr>
                          <td>*italics*</td>
                          <td>
                            <em>italics</em>
                          </td>
                        </tr>
                        <tr>
                          <td>**bold**</td>
                          <td>
                            <b>bold</b>
                          </td>
                        </tr>
                        <tr>
                          <td>[decred!](https://decred.org)</td>
                          <td>
                            <a href="https://decred.org">decred!</a>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            * item 1<br />
                            * item 2<br />
                            * item 3
                          </td>
                          <td>
                            <ul>
                              <li>item 1</li>
                              <li>item 2</li>
                              <li>item 3</li>
                            </ul>
                          </td>
                        </tr>
                        <tr>
                          <td>> quoted text</td>
                          <td>
                            <blockquote>quoted text</blockquote>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            Lines starting with four spaces<br />
                            are treated like code:<br />
                            <br />
                            <span className="spaces">    </span>if 1 * 2 != 3:<br />
                            <span className="spaces">        </span>print
                            "hello, world!"<br />
                          </td>
                          <td>
                            Lines starting with four spaces<br />
                            are treated like code:<br />
                            <pre>
                              if 1 * 2 != 3:<br />    print "hello, world!"{"\n"}
                            </pre>
                          </td>
                        </tr>
                        <tr>
                          <td>~~strikethrough~~</td>
                          <td>
                            <strike>strikethrough</strike>
                          </td>
                        </tr>
                        <tr>
                          <td>super^script</td>
                          <td>
                            super<sup>script</sup>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="roundfield info-notice"> </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connector(SubmitPage);
