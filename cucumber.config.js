export default {
  import: ['features/step_definitions/**/*.ts'],
  format: [
    'progress-bar',
    'html:test-results/cucumber-report.html',
    'json:test-results/cucumber-report.json',
  ],
  formatOptions: { snippetInterface: 'async-await' },
  paths: ['features/**/*.feature'],
};
