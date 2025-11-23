/**
 * Spiritual Gifts Definitions
 *
 * Domain: Spiritual gifts assessment data
 * Responsibility: Core spiritual gift definitions and descriptions
 * Boundaries: Gift definitions only, no scripture or application logic
 */

export interface SpiritualGift {
  name: string;
  description: string;
  biblicalFoundation: string;
  keyScriptures: string[];
  practicalApplications: string[];
  matchingMinistries: string[];
}

export const spiritualGiftsDefinitions: Record<
  string,
  Omit<
    SpiritualGift,
    'keyScriptures' | 'practicalApplications' | 'matchingMinistries'
  >
> = {
  Service: {
    name: 'Service',
    description:
      'The ability to identify and meet the practical needs of others through humble, behind-the-scenes ministry.',
    biblicalFoundation:
      "Service is demonstrated through acts of compassion and practical help, following Jesus' example of washing the disciples' feet.",
  },
  Giving: {
    name: 'Giving',
    description:
      "The ability to generously contribute financial resources, time, and possessions to support God's work and bless others.",
    biblicalFoundation:
      "Giving reflects God's own generous nature and demonstrates trust in His provision.",
  },
  Wisdom: {
    name: 'Wisdom',
    description:
      "The ability to understand God's perspective on life situations and apply biblical truth to complex problems.",
    biblicalFoundation:
      "Wisdom comes from God and enables believers to navigate life's challenges with divine insight.",
  },
  Encouragement: {
    name: 'Encouragement',
    description:
      'The ability to motivate, inspire, and comfort others through words and actions that build faith and hope.',
    biblicalFoundation:
      'Encouragement strengthens the body of Christ and helps believers persevere in their faith.',
  },
  Administration: {
    name: 'Administration',
    description:
      'The ability to organize, plan, and coordinate people and resources effectively for ministry goals.',
    biblicalFoundation:
      'Administration ensures that the church functions orderly and efficiently for maximum impact.',
  },
  Teaching: {
    name: 'Teaching',
    description:
      "The ability to clearly communicate biblical truth and help others understand and apply God's Word.",
    biblicalFoundation:
      'Teaching is essential for making disciples and building up the body of Christ.',
  },
  Leadership: {
    name: 'Leadership',
    description:
      'The ability to cast vision, motivate others, and guide them toward achieving God-given goals.',
    biblicalFoundation:
      'Leadership in the church involves serving others while providing direction and inspiration.',
  },
  Faith: {
    name: 'Faith',
    description:
      'The ability to trust God confidently for His provision and to inspire others to trust Him in impossible situations.',
    biblicalFoundation:
      'Faith is the foundation of our relationship with God and the means by which we please Him.',
  },
  'Creative Arts': {
    name: 'Creative Arts',
    description:
      'The ability to express worship and biblical truth through artistic and creative means.',
    biblicalFoundation:
      "Creativity reflects God's own nature and can be used to glorify Him and touch hearts.",
  },
  Mercy: {
    name: 'Mercy',
    description:
      'The ability to show compassion and care to those who are suffering, with practical help and emotional support.',
    biblicalFoundation:
      "Mercy reflects God's own heart and demonstrates His love to the hurting and broken.",
  },
  Evangelism: {
    name: 'Evangelism',
    description:
      'The ability to effectively share the gospel and lead others to faith in Jesus Christ.',
    biblicalFoundation:
      "Evangelism fulfills the Great Commission and expands God's kingdom on earth.",
  },
  Knowledge: {
    name: 'Knowledge',
    description:
      'The ability to understand and articulate deep biblical truths and theological concepts.',
    biblicalFoundation:
      'Knowledge of God and His Word provides foundation for faith and effective ministry.',
  },
};
