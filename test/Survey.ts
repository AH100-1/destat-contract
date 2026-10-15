import { expect } from "chai";
import { network } from "hardhat";

type Question = {
  question: string;
  options: string[];
};

describe("Survey init", () => {
  const title = "막무가내 설문조사라면";
  const description =
    "중앙화된 설문조사로서, 모든 데이터는 공개되지 않으며 설문조사를 게시한자만 볼 수 있습니다.";
  const questions: Question[] = [
    {
      question: "누가 내 응답을 관리할때 더 솔직할 수 있을까요?",
      options: [
        "구글폼 운영자",
        "탈중앙화된 블록체인 (관리주체 없으며 모든 데이터 공개)",
        "상관없음",
      ],
    },
  ];

  const getSurveyContractAndEthers = async (survey: {
    title: string;
    description: string;
    targetNumber: number;
    questions: Question[];
    pool?: string;
  }) => {
    const { ethers } = await network.connect();
    const cSurvey = await ethers.deployContract(
      "Survey",
      [survey.title, survey.description, survey.targetNumber, survey.questions],
      { value: ethers.parseEther(survey.pool ?? "10") },
    );
    return { ethers, cSurvey };
  };

  describe("Deployment", () => {
    it("should store survey info correctly", async () => {
      const { cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 100,
        questions,
      });

      expect(await cSurvey.title()).to.equal(title);
      expect(await cSurvey.description()).to.equal(description);
      expect(await cSurvey.targetNumber()).to.equal(100);
    });

    it("should calculate rewardAmount correctly", async () => {
      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 4,
        questions,
        pool: "10",
      });

      // 10 ETH / 4명 = 2.5 ETH
      expect(await cSurvey.rewardAmount()).to.equal(ethers.parseEther("2.5"));
    });
  });

  describe("Questions and Answers", () => {
    it("should return questions correctly", async () => {
      const { cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 100,
        questions,
      });

      const stored = await cSurvey.getQuestions();

      expect(stored.length).to.equal(questions.length);
      expect(stored[0].question).to.equal(questions[0].question);
      expect(stored[0].options).to.deep.equal(questions[0].options);
    });

    it("should allow valid answer submission", async () => {
      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 10,
        questions,
      });
      const [, respondent] = await ethers.getSigners();

      await cSurvey
        .connect(respondent)
        .submitAnswer({ respondent: respondent.address, answers: [1] });

      const answers = await cSurvey.getAnswers();

      expect(answers.length).to.equal(1);
      expect(answers[0].respondent).to.equal(respondent.address);
      expect(answers[0].answers).to.deep.equal([1]);
    });

    it("should revert if answer length mismatch", async () => {
      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 10,
        questions,
      });
      const [, respondent] = await ethers.getSigners();

      // 질문은 1개인데 답변은 2개
      await expect(
        cSurvey
          .connect(respondent)
          .submitAnswer({ respondent: respondent.address, answers: [1, 2] }),
      ).to.be.revertedWith("Mismatched answers length");

      expect((await cSurvey.getAnswers()).length).to.equal(0);
    });

    it("should revert if target reached", async () => {
      const targetNumber = 2;
      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber,
        questions,
        pool: "2",
      });
      const [, first, second, third] = await ethers.getSigners();

      await cSurvey
        .connect(first)
        .submitAnswer({ respondent: first.address, answers: [0] });
      await cSurvey
        .connect(second)
        .submitAnswer({ respondent: second.address, answers: [1] });

      // 목표 인원(2명)을 채운 뒤 3번째 응답은 revert
      await expect(
        cSurvey
          .connect(third)
          .submitAnswer({ respondent: third.address, answers: [2] }),
      ).to.be.revertedWith("This survey has been ended");

      expect((await cSurvey.getAnswers()).length).to.equal(targetNumber);
    });
  });

  describe("Rewards", () => {
    it("should pay correct reward to respondent", async () => {
      const { ethers, cSurvey } = await getSurveyContractAndEthers({
        title,
        description,
        targetNumber: 4,
        questions,
        pool: "10",
      });
      const [, respondent] = await ethers.getSigners();
      const reward = ethers.parseEther("2.5");

      // 응답자는 +reward, 컨트랙트는 -reward (가스비는 changeEtherBalances가 자동 보정)
      await expect(
        cSurvey
          .connect(respondent)
          .submitAnswer({ respondent: respondent.address, answers: [0] }),
      ).to.changeEtherBalances(
        ethers,
        [respondent, cSurvey],
        [reward, -reward],
      );
    });
  });
});
