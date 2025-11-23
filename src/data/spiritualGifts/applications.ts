/**
 * Spiritual Gifts Applications
 *
 * Domain: Spiritual gifts assessment data
 * Responsibility: Practical applications and ministry matching for spiritual gifts
 * Boundaries: Applications and ministries only, no definitions or scriptures
 */

export const spiritualGiftsApplications: Record<
  string,
  { practicalApplications: string[]; matchingMinistries: string[] }
> = {
  Service: {
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
