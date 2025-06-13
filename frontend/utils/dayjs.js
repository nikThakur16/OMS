// utils/dayjs.js

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend once globally
dayjs.extend(utc);
dayjs.extend(timezone);

export default dayjs;
