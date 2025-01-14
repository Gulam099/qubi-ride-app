// demoData.ts
export const SupportGroupArray = ["All", "Social", "Family"];
const supportGroupImage1 = require("./assets/images/supportGroupImage-1.png");
const supportGroupImage2 = require("./assets/images/supportGroupImage-2.png");
export const supportGroups = [
  {
    id: 1,
    title: "Psychological Health",
    category: "psychological",
    price: "280 SAR",
    recorded: 30,
    rating: 4.3,
    image: supportGroupImage1,
    details: {
      goals: [
        "Increasing awareness about mental health disorders.",
        "Striving to keep the community mentally safe.",
      ],
      content: [
        "Understanding mental health.",
        "Explaining the concept of mental health and its importance.",
        "Providing strategies for dealing with psychological stress.",
      ],
      consultants: [
        {
          name: "Dr. Deem Abdulla",
          specialty: "Psychologist",
          image: "https://via.placeholder.com/100",
        },
      ],
      faq: [
        {
          question: "What results will the program achieve after completion?",
          answer: "Better understanding of mental health.",
        },
        {
          question: "How long is the program valid for?",
          answer: "Lifetime access.",
        },
      ],
    },
  },
  {
    id: 2,
    title: "Family Harmony",
    category: "family",
    price: "300 SAR",
    recorded: 50,
    rating: 4.7,
    image: supportGroupImage2,
  },
];
