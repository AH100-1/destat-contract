// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

struct Question {
  string question;
  string[] options;
}

struct Answer {
  address respondent;
  uint8[] answers;
}

contract Survey {
  // storage는 key-value 저장소 (slot 번호 -> 32바이트 값)
  // key range
  // 0x0000...0000 : 0
  // 0xFFFF...FFFF : 2^256 - 1
  string public title; // slot 0 (31바이트 이하면 slot에 직접, 길면 keccak256(0) 위치에 저장)
  string public description; // slot 1
  uint256 public targetNumber; // slot 2 (primitive type은 slot에 값 그대로 저장)
  uint256 public rewardAmount; // slot 3
  bool testFlag; // slot 4 (1바이트)
  int16 testInteger; // slot 4 (2바이트, testFlag와 같은 slot에 packing)
  Question[] questions; // slot 5 (배열 길이만 저장, 요소는 keccak256(5)부터)
  Answer[] answers; // slot 6

  // primitive: (u)int8~256, bool, address
  // data location: memory, storage, calldata

  constructor(
    string memory _title,
    string memory _description,
    uint256 _targetNumber,
    Question[] memory _questions
  ) payable {
    title = _title;
    description = _description;
    targetNumber = _targetNumber;
    rewardAmount = msg.value / _targetNumber;
    testFlag = true;
    testInteger = 10000;
    for (uint256 i = 0; i < _questions.length; i++) {
      questions.push(
        Question({
          question: _questions[i].question,
          options: _questions[i].options
        })
      );
    }
  }

  function submitAnswer(Answer calldata _answer) external {
    require(
      _answer.answers.length == questions.length,
      "Mismatched answers length"
    );
    require(answers.length < targetNumber, "This survey has been ended");

    answers.push(
      Answer({respondent: _answer.respondent, answers: _answer.answers})
    );
    payable(msg.sender).transfer(rewardAmount);
  }

  function getQuestions() external view returns (Question[] memory) {
    return questions;
  }

  function getAnswers() external view returns (Answer[] memory) {
    return answers;
  }
}
