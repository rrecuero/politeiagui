import fetchMock from "fetch-mock";
import * as app from "../app";
import * as act from "../types";
import {
  onSubmitProposal,
  onChangeUsername,
  onChangePassword,
  onFetchProposalComments,
  onLogout
} from "../api";
import {
  onFetchProposal as onFetchProposalApi,
  onSubmitComment as onSubmitCommentApi
} from "../api";
import { done } from "./helpers";

describe("test app actions (actions/app.js)", () => {
  const FAKE_CSRF = "fake_csrf_token";
  const MOCK_STATE = {
    api: {
      me: {
        response: {
          csrfToken: FAKE_CSRF
        }
      }
    }
  };
  const FAKE_COMMENT = {
    comment: "fake comment",
    token: "fake_token",
    parentid: 0
  };
  const FAKE_PROPOSAL = {
    token: "fake_token",
    name: "fake name",
    description: "fake description",
    files: []
  };
  const FAKE_USER = {
    id: "2",
    email: "foo@bar.com",
    username: "foobar",
    password: "foobar1234"
  };
  beforeEach(() => {
    //send status 200 to every unmatched request
    fetchMock.restore();
    fetchMock.post("/", {}).catch({});
  });
  test("set reply parent and reset form reply", async () => {
    await expect(app.onSetReplyParent(0)).toDispatchActions([
      { type: act.SET_REPLY_PARENT },
      { type: "@@redux-form/RESET", meta: { form: "form/reply" } }
    ], done);
  });
  test("save new proposal action", async () => {
    const props = {
      loggedInAsEmail: FAKE_USER.email,
      userid: FAKE_USER.id,
      username: FAKE_USER.username
    };
    const proposal = FAKE_PROPOSAL;
    await expect(app.onSaveNewProposal(proposal, null, props))
      .toDispatchActionsWithState(MOCK_STATE,[
        onSubmitProposal(
          props.loggedInAsEmail,
          props.userid,
          props.username,
          proposal.name,
          proposal.description,
          proposal.files
        )
      ], done);
  });

  test("save change username action", async () => {
    const params = {
      password: FAKE_USER.password,
      newUsername: FAKE_USER.username
    };
    await expect(app.onSaveChangeUsername(params))
      .toDispatchActionsWithState(MOCK_STATE,[
        onChangeUsername(params.password, params.newUsername)
      ], done);
  });

  test("save change password action", async () => {
    const existingPassword = FAKE_USER.password;
    const newPassword = "new_pass";
    await expect(app.onSaveChangePassword({ existingPassword, newPassword }))
      .toDispatchActionsWithState(MOCK_STATE,[
        onChangePassword(existingPassword, newPassword)
      ], done);
  });

  test("fetch proposal action", async () => {
    const { token } = FAKE_PROPOSAL;
    await expect(app.onFetchProposal(token))
      .toDispatchActionsWithState(MOCK_STATE, [
        onFetchProposalApi(token),
        onFetchProposalComments(token),
        app.onFetchUsernamesById([])
      ], done);
  });

  test("load me action", () => {
    const { me } = MOCK_STATE.api;
    expect(app.onLoadMe(me))
      .toDispatchActions(
        { type: act.LOAD_ME, payload: me },
        done
      );
  });

  test("on change filter action", () => {
    const option = "any";
    expect(app.onChangeFilter(option))
      .toDispatchActions(
        { type: act.CHANGE_FILTER_VALUE, payload: option },
        done
      );
  });

  test("on change proposal status to approved action", () => {
    const status = "any";
    expect(app.onChangeProposalStatusApproved(status))
      .toDispatchActions(
        { type: act.SET_PROPOSAL_APPROVED, payload: status },
        done
      );
  });

  test("on submit comment action", async () => {
    const { token, comment, parentid } = FAKE_COMMENT;
    const { email } = FAKE_USER;
    await expect(app.onSubmitComment(email, token, comment, parentid))
      .toDispatchActionsWithState(MOCK_STATE, [
        onSubmitCommentApi(email, token, comment, parentid)
      ], done);
  });

  test("on local storage change action", async () => {
    //invalid local storage event leads to logout
    expect(app.onLocalStorageChange(undefined))
      .toDispatchActionsWithState(MOCK_STATE, [
        onLogout()
      ], done);

    //save if values aren't equal
    const mockedNewStorageStateValue = {
      api: {
        me: {
          response: {
            username: "fake_user"
          }
        }
      }
    };
    localStorage.setItem("state", JSON.stringify(mockedNewStorageStateValue));
    const mockedEvent = {
      newValue: JSON.stringify(mockedNewStorageStateValue)
    };
    expect(app.onLocalStorageChange(mockedEvent))
      .toDispatchActionsWithState(MOCK_STATE, [
        app.onLoadMe(mockedNewStorageStateValue.api.me)
      ], done);

    //equal values and undefined/falsy local storage values leads to logout
    localStorage.removeItem("state");
    expect(app.onLocalStorageChange({ newValue: JSON.stringify({}) }))
      .toDispatchActionsWithState(MOCK_STATE, [
        onLogout()
      ], done);

    localStorage.removeItem("state");
    expect(app.onLocalStorageChange({ newValue: JSON.stringify(false) }))
      .toDispatchActionsWithState(MOCK_STATE, [
        onLogout()
      ], done);
  });
});
