// Navigation configuration for all roles
export const navConfig = {
  scout: {
    label: 'Scout Member',
    icon: 'fa-user-graduate',
    links: [
      { path: '/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
      { path: '/my-events', label: 'My Events', icon: 'fa-calendar-check' },
      { path: '/scout-courses', label: 'Scout Courses', icon: 'fa-book' },
      { path: '/my-ideas', label: 'My Ideas', icon: 'fa-lightbulb' },
      { path: '/submit-report', label: 'Submit Report', icon: 'fa-file-alt', unitLeaderOnly: true },
      { path: '/submit-project', label: 'Submit Project', icon: 'fa-project-diagram' },
      { path: '/notifications', label: 'Notifications', icon: 'fa-bell', badge: 3 },
      { path: '/profile', label: 'My Profile', icon: 'fa-user' },
    ],
  },
  district: {
    label: 'District Commissioner',
    icon: 'fa-user-tie',
    links: [
      { path: '/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
      { path: '/manage-readers', label: 'Manage Readers', icon: 'fa-users-cog' },
      { path: '/announcements', label: 'Announcements', icon: 'fa-bullhorn' },
      { path: '/district-members', label: 'Members in District', icon: 'fa-users' },
      { path: '/district-events', label: 'District Events', icon: 'fa-calendar-alt' },
      { path: '/unit-reports', label: 'Unit Reports', icon: 'fa-file-alt' },
      { path: '/scout-ideas', label: 'Scout Ideas', icon: 'fa-lightbulb' },
      { path: '/profile', label: 'My Profile', icon: 'fa-user' },
    ],
  },
  national: {
    label: 'National Commissioner',
    icon: 'fa-crown',
    links: [
      { path: '/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
      { path: '/manage-members', label: 'Manage Members', icon: 'fa-users' },
      { path: '/manage-leaders', label: 'Manage Leaders', icon: 'fa-user-tie' },
      { path: '/national-events', label: 'National Events', icon: 'fa-calendar-alt' },
      { path: '/reports-stats', label: 'Reports & Statistics', icon: 'fa-chart-bar' },
      { path: '/national-announcements', label: 'Announcements', icon: 'fa-bullhorn' },
      { path: '/received-reports', label: 'Received Reports', icon: 'fa-file-alt' },
      { path: '/scout-courses', label: 'Scout Courses', icon: 'fa-book' },
      { path: '/received-projects', label: 'Received Projects', icon: 'fa-project-diagram' },
      { path: '/received-ideas', label: 'Received Ideas', icon: 'fa-lightbulb' },
      { path: '/profile', label: 'My Profile', icon: 'fa-user' },
    ],
  },
  donation: {
    label: 'Donation',
    icon: 'fa-hand-holding-heart',
    links: [
      { path: '/dashboard', label: 'Dashboard', icon: 'fa-chart-pie' },
      { path: '/my-donations', label: 'My Donations', icon: 'fa-heart' },
      { path: '/supporting-projects', label: 'Supporting Projects & Events', icon: 'fa-hands-helping' },
      { path: '/updates', label: 'Updates', icon: 'fa-bell' },
      { path: '/my-ideals', label: 'My Ideals', icon: 'fa-star' },
      { path: '/profile', label: 'My Profile', icon: 'fa-user' },
    ],
  },
};

// Sample data for stats
export const statsData = [
  { icon: 'fa-user-graduate', number: '5,000+', label: 'Active Scouts' },
  { icon: 'fa-chalkboard-teacher', number: '1,200+', label: 'Trained Leaders' },
  { icon: 'fa-map-marked-alt', number: '30', label: 'Districts' },
  { icon: 'fa-calendar-check', number: '85+', label: 'Events Yearly' },
  { icon: 'fa-hands-helping', number: '240+', label: 'Community Projects' },
];

// Sample data for recent activities
export const recentActivities = [
  { id: 1, title: 'National Leadership Camp', date: '2026-08-20', status: 'upcoming' },
  { id: 2, title: 'Tree Planting Campaign', date: '2026-09-12', status: 'upcoming' },
  { id: 3, title: 'National Scout Camp 2026', date: '2026-07-15', status: 'completed' },
];

// Sample notifications
export const notifications = [
  { id: 1, message: 'Your report has been approved', time: '2 hours ago', read: false },
  { id: 2, message: 'New event: Leadership Camp', time: '5 hours ago', read: false },
  { id: 3, message: 'Your project is under review', time: '1 day ago', read: true },
];

// Sample events
export const events = [
  {
    id: 1,
    title: 'National Leadership Camp',
    date: '20 August 2026',
    location: 'Nyagatare',
    participants: 500,
    status: 'open',
    registered: 350,
    total: 500,
  },
  {
    id: 2,
    title: 'Tree Planting Campaign',
    date: '12 September 2026',
    location: 'Huye',
    participants: 300,
    status: 'open',
    registered: 120,
    total: 300,
  },
];

// Sample members
export const members = [
  { id: 1, name: 'Jean Paul', district: 'Gasabo', role: 'Scout Leader', status: 'active' },
  { id: 2, name: 'Marie Claire', district: 'Musanze', role: 'Rover Scout', status: 'active' },
  { id: 3, name: 'Eric Ndayi', district: 'Huye', role: 'Scout Member', status: 'pending' },
];

// Sample reports
export const reports = [
  {
    id: 1,
    title: 'Monthly Activity Report',
    submittedBy: 'Unit Leader - Gasabo',
    date: '2026-07-01',
    status: 'pending',
  },
  {
    id: 2,
    title: 'Quarterly Progress Report',
    submittedBy: 'Unit Leader - Musanze',
    date: '2026-06-15',
    status: 'approved',
  },
];

// Sample ideas
export const ideas = [
  {
    id: 1,
    title: 'Community Tree Planting Initiative',
    submittedBy: 'John Doe',
    date: '2026-07-10',
    status: 'under-review',
  },
  {
    id: 2,
    title: 'Youth Leadership Workshop',
    submittedBy: 'Alice Uwase',
    date: '2026-06-25',
    status: 'approved',
  },
];

// Sample donations
export const donations = [
  { id: 1, project: 'Tree Planting Campaign', amount: 500000, date: '2026-07-15', status: 'completed' },
  { id: 2, project: 'National Leadership Camp', amount: 250000, date: '2026-07-01', status: 'pending' },
];

// Footer columns data
export const footerColumns = [
  {
    title: 'About MSR',
    links: ['Rwanda Scout Association', 'Our History', 'Mission & Vision', 'Organization Structure', 'MSR Development Team']
  },
  {
    title: 'Programs',
    links: ['Scout Courses', 'Leadership Training', 'Community Service', 'SDG Action', 'Messengers of Peace']
  },
  {
    title: 'Resources',
    links: ['Member Dashboard', 'Reports & Statistics', 'News & Updates', 'Photo Gallery', 'FAQs']
  },
  {
    title: 'Get Involved',
    links: ['Become a Scout', 'Volunteer', 'Donate', 'Become a Partner', 'Sponsor an Event']
  },
  {
    title: 'Contact',
    links: ['Email Us', 'Phone', 'Visit Us', 'Support Center', 'Feedback']
  }
];

// Social links
export const socialLinks = [
  { icon: 'fa-facebook-f', href: '#' },
  { icon: 'fa-x-twitter', href: '#' },
  { icon: 'fa-instagram', href: '#' },
  { icon: 'fa-linkedin-in', href: '#' },
  { icon: 'fa-youtube', href: '#' }
];

// Duty data for Scout Responsibilities
export const dutiesData = [
  { icon: 'fa-hands-praying', title: 'Duty to God', description: 'Faithfulness, reverence, and spiritual growth' },
  { icon: 'fa-users', title: 'Duty to Others', description: 'Service, kindness, and community leadership' },
  { icon: 'fa-user-check', title: 'Duty to Self', description: 'Discipline, integrity, and personal development' },
];

// Success stories data
export const storiesData = [
  {
    id: 1,
    name: 'John Doe',
    location: 'Kigali · Gasabo',
    role: 'Scout Leader',
    quote: 'Scouting gave me purpose. I now lead 50 young scouts in my community.',
    avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Ccircle cx=%22100%22 cy=%22100%22 r=%22100%22 fill=%22%23FFD100%22/%3E%3Ccircle cx=%22100%22 cy=%2275%22 r=%2235%22 fill=%22%23002B5C%22/%3E%3Ccircle cx=%2275%22 cy=%2275%22 r=%228%22 fill=%22white%22/%3E%3Ccircle cx=%22125%22 cy=%2275%22 r=%228%22 fill=%22white%22/%3E%3Cpath d=%22M65 140 Q100 160 135 140%22 stroke=%22%23002B5C%22 stroke-width=%2212%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3C/svg%3E'
  },
  {
    id: 2,
    name: 'Alice Uwase',
    location: 'Musanze · Musanze',
    role: 'Rover Scout',
    quote: "I've learned leadership, teamwork, and how to serve my community.",
    avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Ccircle cx=%22100%22 cy=%22100%22 r=%22100%22 fill=%22%23FFD100%22/%3E%3Ccircle cx=%22100%22 cy=%2270%22 r=%2230%22 fill=%22%23002B5C%22/%3E%3Ccircle cx=%2278%22 cy=%2270%22 r=%227%22 fill=%22white%22/%3E%3Ccircle cx=%22122%22 cy=%2270%22 r=%227%22 fill=%22white%22/%3E%3Cpath d=%22M70 130 Q100 150 130 130%22 stroke=%22%23002B5C%22 stroke-width=%2210%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3C/svg%3E'
  },
  {
    id: 3,
    name: 'Eric Ndayi',
    location: 'Huye · Huye',
    role: 'Scout Member',
    quote: 'From a shy student to a confident leader — scouting changed my life.',
    avatar: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22200%22 height=%22200%22 viewBox=%220 0 200 200%22%3E%3Ccircle cx=%22100%22 cy=%22100%22 r=%22100%22 fill=%22%23FFD100%22/%3E%3Ccircle cx=%22100%22 cy=%2272%22 r=%2232%22 fill=%22%23002B5C%22/%3E%3Ccircle cx=%2276%22 cy=%2272%22 r=%227%22 fill=%22white%22/%3E%3Ccircle cx=%22124%22 cy=%2272%22 r=%227%22 fill=%22white%22/%3E%3Cpath d=%22M68 135 Q100 155 132 135%22 stroke=%22%23002B5C%22 stroke-width=%2210%22 fill=%22none%22 stroke-linecap=%22round%22/%3E%3C/svg%3E'
  }
];

// Upcoming events data
export const upcomingEventsData = [
  {
    id: 1,
    title: 'National Leadership Camp',
    date: '20 August 2026',
    location: 'Nyagatare',
    participants: 500,
    registrationClose: '15 August 2026',
    status: 'open',
    registered: 350,
    total: 500,
    bgColor: '#d4edda',
    icon: 'fa-campground',
  },
  {
    id: 2,
    title: 'Tree Planting Campaign',
    date: '12 September 2026',
    location: 'Huye',
    participants: 300,
    status: 'open',
    registered: 120,
    total: 300,
    bgColor: '#fff3cd',
    icon: 'fa-tree',
  },
];

// Recent events data
export const recentEventsData = [
  {
    id: 1,
    title: 'National Scout Camp 2026',
    location: 'Musanze',
    date: 'July 2026',
    participants: 1200,
    status: 'completed',
    bgColor: '#e2e3e5',
    icon: 'fa-flag',
  },
  {
    id: 2,
    title: 'Community Clean-up Drive',
    location: 'Kigali',
    date: 'June 2026',
    participants: 400,
    status: 'completed',
    bgColor: '#d4edda',
    icon: 'fa-hand-holding-heart',
  },
];