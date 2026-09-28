import { expect } from "chai";
import { network } from "hardhat";

const questions = [
  {
    question: "What is your favorite programming language?",
    options: ["Solidity", "TypeScript", "Python", "Rust"],
  },
  {
    question: "How many years have you been programming?",
    options: ["Less than 1 year", "1 to 3 years", "More than 3 years"],
  },
];

describe("Survey Contract", () => {
  let ethers;
  let survey, owner, respondent1, respondent2;
  let poolAmount;

  const targetNumber = 10;

  beforeEach(async () => {
    ({ ethers } = await network.connect());
    poolAmount = ethers.parseEther("5");

    [owner, respondent1, respondent2] = await ethers.getSigners();

    survey = await ethers.deployContract(
      "Survey",
      ["Developer survey", "A survey about developers", targetNumber, questions],
      { value: poolAmount },
    );
  });

  it("should store the values given to the constructor", async () => {
    expect(await survey.title()).to.equal("Developer survey");
    expect(await survey.description()).to.equal("A survey about developers");
    expect(await survey.targetNumber()).to.equal(targetNumber);
    expect(await survey.rewardAmount()).to.equal(
      poolAmount / BigInt(targetNumber),
    );
  });

  it("should return the questions registered at deployment", async () => {
    const stored = await survey.getQuestions();

    expect(stored.length).to.equal(questions.length);
    expect(stored[0].question).to.equal(questions[0].question);
    expect(stored[0].options).to.deep.equal(questions[0].options);
    expect(stored[1].question).to.equal(questions[1].question);
    expect(stored[1].options).to.deep.equal(questions[1].options);
  });

  it("should keep the submitted answer and pay the reward", async () => {
    const reward = await survey.rewardAmount();

    const tx = await survey
      .connect(respondent1)
      .submitAnswer({ respondent: respondent1.address, answers: [0, 1] });

    await expect(tx).to.changeEtherBalance(ethers, survey, -reward);

    const answers = await survey.getAnswers();
    expect(answers.length).to.equal(1);
    expect(answers[0].respondent).to.equal(respondent1.address);
    expect(answers[0].answers).to.deep.equal([0, 1]);
  });

  it("should collect answers from several respondents", async () => {
    await survey
      .connect(respondent1)
      .submitAnswer({ respondent: respondent1.address, answers: [0, 1] });
    await survey
      .connect(respondent2)
      .submitAnswer({ respondent: respondent2.address, answers: [3, 2] });

    const answers = await survey.getAnswers();

    expect(answers.length).to.equal(2);
    expect(answers[1].respondent).to.equal(respondent2.address);
    expect(answers[1].answers).to.deep.equal([3, 2]);
  });

  it("should revert if the answer count does not match the questions", async () => {
    await expect(
      survey
        .connect(respondent1)
        .submitAnswer({ respondent: respondent1.address, answers: [0] }),
    ).to.be.revertedWith("Mismatched answers length");

    expect((await survey.getAnswers()).length).to.equal(0);
  });

  it("should revert once the target number of answers is reached", async () => {
    const smallSurvey = await ethers.deployContract(
      "Survey",
      ["Tiny survey", "Only one respondent allowed", 1, questions],
      { value: poolAmount },
    );

    await smallSurvey
      .connect(respondent1)
      .submitAnswer({ respondent: respondent1.address, answers: [0, 1] });

    await expect(
      smallSurvey
        .connect(respondent2)
        .submitAnswer({ respondent: respondent2.address, answers: [1, 2] }),
    ).to.be.revertedWith("This survey has been ended");

    expect((await smallSurvey.getAnswers()).length).to.equal(1);
  });
});
