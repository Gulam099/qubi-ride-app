export const libraryContent = [
  {
    id: "1",
    title: "Psychological Health",
    category: "psychological",
    description:
      "Mental health is a state of psychological well-being that enables a person to cope with life's stresses.",
    type: "video", // Could be "video", "article", or "audio"
    duration: "15:00", // For videos/audio, duration of the content
    thumbnail:
      "https://plus.unsplash.com/premium_photo-1668130718429-7abf7b186f2f?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8eW91dHViZSUyMHRodW1ibmFpbHxlbnwwfHwwfHx8MA%3D%3D", // Thumbnail image for the content
    mediaUrl:
      "https://techmier.blr1.cdn.digitaloceanspaces.com/services/OffensiveSecurity.mp4", // Media file URL (for video/audio)
    seenCount: 30, // Number of times the content has been viewed
    rating: 4.4,
    likes: 21,
    shares: 24,
    publishedDate: "17 June 2022", // Date of publication
    subjects: [
      { title: "Psychological advice", time: "01:12" },
      { title: "Psychological advice", time: "03:42" },
      { title: "Psychological advice", time: "08:59" },
    ],
    feedback: [
      {
        user: "a******",
        comment: "Good",
        date: "05 Sep 2023",
      },
      {
        user: "b******",
        comment: "Very informative",
        date: "04 Sep 2023",
      },
    ],
    author: {
      name: "Dr. Dame Abdullah",
      specialization: "Psychologist",
      profileImage: "https://via.placeholder.com/100",
    },
  },
  {
    id: "2",
    title: "Mental Health: Enhancing our Response",
    category: "psychological",
    description:
      "This article provides insights into mental health challenges and coping strategies.",
    type: "article",
    thumbnail:
      "https://i.pinimg.com/736x/19/db/31/19db31732931019b73bedcf17924f814.jpg",
    seenCount: 15,
    rating: 4.0,
    likes: 10,
    shares: 5,
    publishedDate: "17 June 2022",
    content: `
        Mental health is a state of psychological well-being that enables a person to cope with life's stresses. 
        Mental health is a state of psychological well-being that enables a person to cope with the stresses of life.
      `,
    feedback: [
      {
        user: "c******",
        comment: "Excellent insights",
        date: "05 Sep 2023",
      },
    ],
    author: {
      name: "Dr. Dame Abdullah",
      specialization: "Psychologist",
      profileImage: "https://via.placeholder.com/100",
    },
  },
  {
    id: "3",
    title: "Understanding Mental Health",
    category: "psychological",
    description: "Audio discussion on how to manage stress and anxiety.",
    type: "audio",
    duration: "20:00",
    mediaUrl:
      "https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3",
    thumbnail:
      "https://i.pinimg.com/736x/19/db/31/19db31732931019b73bedcf17924f814.jpg",
    seenCount: 15,
    rating: 4.0,
    likes: 10,
    shares: 5,
    publishedDate: "15 May 2022",
    feedback: [
      {
        user: "d******",
        comment: "Great audio session",
        date: "10 May 2022",
      },
    ],
    author: {
      name: "Dr. Jane Doe",
      specialization: "Therapist",
      profileImage: "https://via.placeholder.com/100",
    },
  },
];
