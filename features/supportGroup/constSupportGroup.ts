// demoData.ts
export const SupportGroupArray = ["All", "Social", "Family"];
const supportGroupImage1 = require("./assets/images/supportGroupImage-1.png");
const supportGroupImage2 = require("./assets/images/supportGroupImage-2.png");
export const supportGroups = [
  {
    id: "5465464",
    title: "Psychological Health",
    category: "psychological",
    description: " Mental health is a state of psychological well-being that enables a person to cope with the stresses of life",
    image: supportGroupImage1,
    price: 280,
    recordedCount: 81,
    rating: 4.3,
    likes: 21,
    shares: 64,
    groupGoals: [
      "Increasing awareness about mental health disorders.",
      "Striving to keep the community mentally safe.",
    ],
    programContent: [
      {
        title: "Understanding mental health",
        description: "Explain the concept of mental health and its importance.",
      },
      {
        title: "Providing strategies for dealing with psychological stress",
        description:
          "Explain how to deal with stress and psychological pressures in daily life.",
      },
    ],
    consultants: [
      {
        id: "56466777",
        name: "Dr. Deem Abdullah",
        specialization: "Psychologists",
        image: "https://via.placeholder.com/100",
      },
    ],
    faq: [
      {
        question: "What results will the program achieve after its completion?",
        answer: "Participants will gain coping mechanisms and awareness.",
      },
      {
        question: "How long is the program valid for?",
        answer: "The program is valid for 1 month.",
      },
    ],
    availableDates: [
      "2024-12-01T11:00:00Z",
      "2024-12-01T14:00:00Z",
      "2024-12-02T09:00:00Z",
      "2024-12-02T12:00:00Z",
    ],
  },
  {
    id: "2",
    title: "Psychological Health",
    category: "family",
    description: " Mental health is a state of psychological well-being that enables a person to cope with the stresses of life",
    image: supportGroupImage2,
    price: 280,
    recordedCount: 81,
    rating: 4.3,
    likes: 21,
    shares: 64,
    groupGoals: [
      "Increasing awareness about mental health disorders.",
      "Striving to keep the community mentally safe.",
    ],
    programContent: [
      {
        title: "Understanding mental health",
        description: "Explain the concept of mental health and its importance.",
      },
      {
        title: "Providing strategies for dealing with psychological stress",
        description:
          "Explain how to deal with stress and psychological pressures in daily life.",
      },
    ],
    consultants: [
      {
        id: "1",
        name: "Dr. Deem Abdullah",
        specialization: "Psychologists",
        image: "https://via.placeholder.com/100",
      },
      {
        id: "2",
        name: "Dr. Deem Abdullah",
        specialization: "Psychologists",
        image: "https://via.placeholder.com/100",
      },
    ],
    faq: [
      {
        question: "What results will the program achieve after its completion?",
        answer: "Participants will gain coping mechanisms and awareness.",
      },
      {
        question: "How long is the program valid for?",
        answer: "The program is valid for 1 month.",
      },
    ],
    availableDates: [
      "2024-12-01T11:00:00Z",
      "2024-12-01T14:00:00Z",
      "2024-12-02T09:00:00Z",
      "2024-12-02T12:00:00Z",
    ],
  },
];
