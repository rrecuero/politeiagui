import * as snew from "../snew";

describe("snew tests (lib/snew)", () => {
  const PROPOSAL_TOKEN = "6284c5f8fba5665373b8e6651ebc8747b289fed242d2f880f64a284496bb4ca11";
  const PROPOSAL_TOKEN_2 = "6284c5f8fba5665373b8e6651ebc8747b289fed242d2f880f64a284496bb4ca7";
  test("format proposal data", async () => {
    const { proposal } = await import(`../../../mocks/api/v1/proposals/${PROPOSAL_TOKEN}/GET.json`);
    const { votes } = await import("../../../mocks/api/v1/proposals/activevote/GET.json");
    const index = 1;
    let result = snew.formatProposalData(proposal, index, votes);
    let { data, kind } = result;
    expect(kind).toEqual("t3");
    expect(data.startvote).toBeTruthy();
    expect(data.startvotereply).toBeTruthy();
    expect(data.rank).toEqual(index + 1);
    expect(data.name).toEqual(`t3_${PROPOSAL_TOKEN}`);
    expect(data.author).toEqual(proposal.username);
    expect(data.authorid).toEqual(proposal.userid);
    expect(data.title).toEqual(proposal.name);
    expect(data.permalink).toEqual(`/proposals/${PROPOSAL_TOKEN}/`);
    expect(data.url).toEqual(`/proposals/${PROPOSAL_TOKEN}/`);
    expect(data.is_self).toBeTruthy();
    //test case when active votes isn't provided and the proposal hasn't a name
    delete proposal.name;
    result = snew.formatProposalData(proposal, index);
    data = result.data;
    expect(data.startvote).toBeFalsy();
    expect(data.startvotereply).toBeFalsy();
    expect(data.title).toEqual("(Proposal name hidden)");
    //test case when activevotes doesn't contain the given proposal
    const { proposal: anotherProposal } = await import(`../../../mocks/api/v1/proposals/${PROPOSAL_TOKEN_2}/GET.json`);
    result = snew.formatProposalData(anotherProposal, index, votes);
    data = result.data;
    expect(data.startvote).toBeFalsy();
    expect(data.startvotereply).toBeFalsy();
  });

  test("comments to T1", async() => {
    const { comments } = await import(`../../../mocks/api/v1/proposals/${PROPOSAL_TOKEN}/comments/GET.json`);
    let result = snew.commentsToT1(comments);
    let comment = comments[0];
    let resultComment = result[0];
    const { kind, data } = resultComment;
    expect(kind).toEqual("t1");
    expect(data.author).toEqual(comment.userid);
    expect(data.parent_id).toEqual("0");
    expect(data.name).toEqual(comment.commentid);
    expect(data.body).toEqual(comment.comment);
    expect(data.permalink).toEqual(`/proposals/${comment.token}/comments/${comment.commentid}`);

    // Test the username display.
    comment.username = "foobar";
    result = snew.commentsToT1([comment]);
    resultComment = result[0];
    expect(resultComment.data.author).toEqual(comment.username);
  });
});
