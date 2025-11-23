export interface SpiritualGift {
  name: string;
  description: string;
  biblicalFoundation: string;
  keyScriptures: string[];
  practicalApplications: string[];
  matchingMinistries: string[];
}

export const spiritualGiftsData: Record<string, SpiritualGift> = {
  Service: {
    name: 'Service',
    description:
      'The ability to identify and meet the practical needs of others through humble, behind-the-scenes ministry.',
    biblicalFoundation:
      "Service is demonstrated through acts of compassion and practical help, following Jesus' example of washing the disciples' feet.",
    keyScriptures: [
      "Galatians 5:13 - 'Serve one another humbly in love.'",
      "Mark 10:45 - 'For even the Son of Man did not come to be served, but to serve.'",
      "1 Peter 4:10 - 'Use whatever gift you have received to serve others.'",
    ],
    practicalApplications: [
      'Helping with event setup and cleanup',
      'Assisting elderly or disabled members',
      'Providing meals for families in need',
      'Maintaining church facilities',
      'Transportation ministry',
    ],
    matchingMinistries: [
      'Facilities',
      'Hospitality',
      'Care Ministries',
      'Operations',
    ],
  },
  Giving: {
    name: 'Giving',
    description:
      "The ability to generously contribute financial resources, time, and possessions to support God's work and bless others.",
    biblicalFoundation:
      "Giving reflects God's own generous nature and demonstrates trust in His provision.",
    keyScriptures: [
      "2 Corinthians 9:7 - 'God loves a cheerful giver.'",
      "Acts 20:35 - 'It is more blessed to give than to receive.'",
      "Matthew 6:3-4 - 'Give in secret, and your Father will reward you.'",
    ],
    practicalApplications: [
      'Financial stewardship and budgeting',
      'Fundraising for special projects',
      'Supporting missionaries and ministries',
      'Resource management',
      'Benevolence fund administration',
    ],
    matchingMinistries: ['Stewardship', 'Missions', 'Finance', 'Benevolence'],
  },
  Wisdom: {
    name: 'Wisdom',
    description:
      "The ability to understand God's perspective on life situations and apply biblical truth to complex problems.",
    biblicalFoundation:
      "Wisdom comes from God and enables believers to navigate life's challenges with divine insight.",
    keyScriptures: [
      "James 1:5 - 'If any of you lacks wisdom, ask God.'",
      "Proverbs 2:6 - 'The Lord gives wisdom.'",
      "Colossians 1:9 - 'Filled with the knowledge of His will in all spiritual wisdom.'",
    ],
    practicalApplications: [
      'Biblical counseling and guidance',
      'Conflict resolution',
      'Strategic planning for ministry',
      'Mentoring and discipleship',
      'Teaching practical life application',
    ],
    matchingMinistries: [
      'Counseling',
      'Eldership',
      'Discipleship',
      'Leadership',
    ],
  },
  Encouragement: {
    name: 'Encouragement',
    description:
      'The ability to motivate, inspire, and comfort others through words and actions that build faith and hope.',
    biblicalFoundation:
      'Encouragement strengthens the body of Christ and helps believers persevere in their faith.',
    keyScriptures: [
      "1 Thessalonians 5:11 - 'Encourage one another and build each other up.'",
      "Hebrews 3:13 - 'Encourage one another daily.'",
      "2 Corinthians 1:3-4 - 'God comforts us so we can comfort others.'",
    ],
    practicalApplications: [
      'Writing encouraging notes and cards',
      'One-on-one mentoring',
      'Prayer ministry',
      'Support group leadership',
      'Visiting the sick and lonely',
    ],
    matchingMinistries: [
      'Care Ministries',
      'Prayer Team',
      'Small Groups',
      'Visitation',
    ],
  },
  Administration: {
    name: 'Administration',
    description:
      'The ability to organize, plan, and coordinate people and resources effectively for ministry goals.',
    biblicalFoundation:
      'Administration ensures that the church functions orderly and efficiently for maximum impact.',
    keyScriptures: [
      "1 Corinthians 12:28 - 'Those with gifts of administration.'",
      "Luke 14:28 - 'Count the cost before beginning.'",
      "Exodus 18:21 - 'Select capable men who fear God, trustworthy men.'",
    ],
    practicalApplications: [
      'Event planning and coordination',
      'Volunteer scheduling',
      'Office management',
      'Program development',
      'Resource allocation',
    ],
    matchingMinistries: [
      'Operations',
      'Events',
      'Office Administration',
      'Program Management',
    ],
  },
  Teaching: {
    name: 'Teaching',
    description:
      "The ability to clearly communicate biblical truth and help others understand and apply God's Word.",
    biblicalFoundation:
      'Teaching is essential for making disciples and building up the body of Christ.',
    keyScriptures: [
      "Romans 12:7 - 'If your gift is teaching, then teach.'",
      "2 Timothy 2:2 - 'Entrust to reliable people who will teach others.'",
      "Ephesians 4:11-12 - 'Christ gave teachers to equip his people.'",
    ],
    practicalApplications: [
      'Bible study leadership',
      'Sunday school teaching',
      'Discipleship programs',
      'Curriculum development',
      'Preaching and speaking',
    ],
    matchingMinistries: [
      'Christian Education',
      'Small Groups',
      'Youth Ministry',
      'Adult Education',
    ],
  },
  Leadership: {
    name: 'Leadership',
    description:
      'The ability to cast vision, motivate others, and guide them toward achieving God-given goals.',
    biblicalFoundation:
      'Leadership in the church involves serving others while providing direction and inspiration.',
    keyScriptures: [
      "Hebrews 13:17 - 'Have confidence in your leaders and submit to their authority.'",
      "1 Timothy 3:1 - 'If anyone aspires to be an overseer, he desires a noble task.'",
      "Matthew 20:26 - 'Whoever wants to become great among you must be your servant.'",
    ],
    practicalApplications: [
      'Ministry team leadership',
      'Vision casting and planning',
      'Team building and development',
      'Decision making and guidance',
      'Strategic initiative leadership',
    ],
    matchingMinistries: [
      'Leadership',
      'Eldership',
      'Ministry Teams',
      'Strategic Planning',
    ],
  },
  Faith: {
    name: 'Faith',
    description:
      'The ability to trust God confidently for His provision and to inspire others to trust Him in impossible situations.',
    biblicalFoundation:
      'Faith is the foundation of our relationship with God and the means by which we please Him.',
    keyScriptures: [
      "Hebrews 11:1 - 'Faith is confidence in what we hope for.'",
      "Romans 12:6 - 'If your gift is prophesying, then prophesy in accordance with your faith.'",
      "2 Corinthians 5:7 - 'For we live by faith, not by sight.'",
    ],
    practicalApplications: [
      'Prayer ministry and intercession',
      'Faith-based initiatives',
      'Trust-building in ministry',
      'Inspirational speaking',
      'Miracle and healing prayer',
    ],
    matchingMinistries: [
      'Prayer Team',
      'Healing Ministry',
      'Faith Initiatives',
      'Spiritual Formation',
    ],
  },
  'Creative Arts': {
    name: 'Creative Arts',
    description:
      'The ability to express worship and biblical truth through artistic and creative means.',
    biblicalFoundation:
      "Creativity reflects God's own nature and can be used to glorify Him and touch hearts.",
    keyScriptures: [
      "Exodus 35:31-32 - 'Filled with the Spirit of God, with skill, ability and knowledge in all kinds of crafts.'",
      "Psalm 150:3-6 - 'Praise Him with the sounding of the trumpet, harp and lyre.'",
      "1 Chronicles 16:23-24 - 'Sing to the Lord, proclaim His salvation.'",
    ],
    practicalApplications: [
      'Worship leading and music',
      'Drama and creative arts',
      'Visual arts and design',
      'Multimedia production',
      'Creative worship experiences',
    ],
    matchingMinistries: [
      'Worship Arts',
      'Creative Ministries',
      'Media Production',
      'Visual Arts',
    ],
  },
  Mercy: {
    name: 'Mercy',
    description:
      'The ability to show compassion and care to those who are suffering, with practical help and emotional support.',
    biblicalFoundation:
      "Mercy reflects God's own heart and demonstrates His love to the hurting and broken.",
    keyScriptures: [
      "Matthew 5:7 - 'Blessed are the merciful, for they will be shown mercy.'",
      "Romans 12:8 - 'If it is showing mercy, do it cheerfully.'",
      "Jude 1:22-23 - 'Be merciful to those who doubt.'",
    ],
    practicalApplications: [
      'Hospitality and welcome ministry',
      'Care for the sick and elderly',
      'Crisis response and support',
      'Counseling and listening',
      'Practical help for families',
    ],
    matchingMinistries: [
      'Care Ministries',
      'Hospitality',
      'Counseling',
      'Benevolence',
    ],
  },
  Evangelism: {
    name: 'Evangelism',
    description:
      'The ability to effectively share the gospel and lead others to faith in Jesus Christ.',
    biblicalFoundation:
      "Evangelism fulfills the Great Commission and expands God's kingdom on earth.",
    keyScriptures: [
      "Matthew 28:19-20 - 'Go and make disciples of all nations.'",
      "Acts 1:8 - 'You will be my witnesses in Jerusalem, Judea, Samaria, and to the ends of the earth.'",
      "2 Timothy 4:5 - 'Do the work of an evangelist.'",
    ],
    practicalApplications: [
      'Community outreach programs',
      'Personal evangelism training',
      'Follow-up and discipleship',
      'Cross-cultural ministry',
      'Event-based evangelism',
    ],
    matchingMinistries: [
      'Outreach',
      'Evangelism',
      'Missions',
      'Community Engagement',
    ],
  },
  Knowledge: {
    name: 'Knowledge',
    description:
      'The ability to understand and articulate deep biblical truths and theological concepts.',
    biblicalFoundation:
      'Knowledge of God and His Word provides foundation for faith and effective ministry.',
    keyScriptures: [
      "1 Corinthians 12:8 - 'To one there is given through the Spirit a message of knowledge.'",
      "Colossians 2:3 - 'In Christ are hidden all the treasures of wisdom and knowledge.'",
      "Proverbs 1:7 - 'The fear of the Lord is the beginning of knowledge.'",
    ],
    practicalApplications: [
      'Biblical research and study',
      'Theological education',
      'Apologetics and defense of faith',
      'Curriculum development',
      'Teaching complex biblical concepts',
    ],
    matchingMinistries: [
      'Christian Education',
      'Theological Training',
      'Apologetics',
      'Bible Study Leadership',
    ],
  },
};

export function getSpiritualGift(giftName: string): SpiritualGift | undefined {
  return spiritualGiftsData[giftName];
}

export function getAllSpiritualGifts(): SpiritualGift[] {
  return Object.values(spiritualGiftsData);
}
