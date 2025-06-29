# Office Management System - Leave Management Module

A comprehensive Leave Management System built with Next.js, MongoDB, and TailwindCSS, fully integrated into an Office Management Platform.

## 🚀 Features

### 👥 Role-Based Access Control

#### **Employee**
- ✅ View personal leave balance and history
- ✅ Submit new leave requests with validation
- ✅ Track status of submitted leaves (pending/approved/rejected)
- ✅ Cancel pending requests with comments
- ✅ View leave quotas and remaining days

#### **Manager**
- ✅ View leave requests from team members
- ✅ Approve or reject requests with optional remarks
- ✅ View team calendar to avoid leave conflicts
- ✅ Access to personal leave management features

#### **HR**
- ✅ All Manager capabilities
- ✅ Manage leave types (Casual, Sick, Annual, etc.)
- ✅ Adjust leave balances manually
- ✅ View all employee leaves and history
- ✅ Generate comprehensive reports and filters
- ✅ Manage leave quotas for all employees

#### **Admin**
- ✅ All HR functionality
- ✅ View system-wide stats and logs
- ✅ Manage user-role assignments (promote user to manager/HR)
- ✅ Access to admin tools for system configuration
- ✅ Full system override capabilities

## 📦 Core Features

### 📋 Leave Application System
- **Smart Form Validation**: Date range validation, balance checking, overlap detection
- **Leave Type Management**: Configurable leave types with descriptions
- **Half-Day Support**: Option for half-day leave requests
- **Reason Tracking**: Mandatory reason field for leave requests
- **Balance Display**: Real-time leave balance before submission

### 📊 Leave Management Dashboard
- **Role-Based Views**: Different dashboards for each user role
- **Quick Statistics**: Total balance, pending requests, approved leaves
- **Recent Activity**: Latest leave requests with status indicators
- **Navigation Cards**: Easy access to all leave-related functions

### 🔍 Leave Management Interface
- **Advanced Filtering**: Filter by status, user, leave type, date range
- **Bulk Actions**: Approve/reject multiple requests
- **Comment System**: Add remarks for approvals/rejections
- **Status Tracking**: Visual status indicators with color coding

### 📈 Reporting & Analytics
- **Summary Statistics**: Overall leave statistics
- **Type-wise Breakdown**: Leave distribution by type
- **User-wise Reports**: Individual employee leave patterns
- **Export Capabilities**: Data export for external analysis

### ⚙️ System Administration
- **User Role Management**: Promote/demote users between roles
- **Leave Type Configuration**: Create, edit, delete leave types
- **Quota Management**: Set and adjust leave quotas per user/type/year
- **System Settings**: Default configurations and system information

## 🛠️ Technical Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **RTK Query**: State management and API integration
- **React Hook Form**: Form handling and validation
- **Day.js**: Date manipulation library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: Authentication and authorization
- **bcrypt**: Password hashing

### Key Libraries
- **react-hot-toast**: Toast notifications
- **formik & yup**: Form validation
- **dayjs**: Date handling

## 📁 Project Structure

```
OMS/
├── backend/
│   ├── controllers/
│   │   ├── leaveController.js      # Leave business logic
│   │   ├── userController.js       # User management
│   │   └── authController.js       # Authentication
│   ├── models/
│   │   ├── LeaveRequest.js         # Leave request schema
│   │   ├── LeaveType.js            # Leave type schema
│   │   ├── LeaveQuota.js           # Leave quota schema
│   │   └── User.js                 # User schema
│   ├── routes/
│   │   ├── leaveRoutes.js          # Leave API routes
│   │   └── userRoutes.js           # User API routes
│   └── middleware/
│       └── authMiddleware.js       # Role-based authorization
├── frontend/
│   ├── app/[role]/leaves/
│   │   ├── page.tsx                # Leave dashboard
│   │   ├── apply/page.tsx          # Apply for leave
│   │   ├── balance/page.tsx        # Leave balance
│   │   ├── history/page.tsx        # Leave history
│   │   ├── management/page.tsx     # Leave management
│   │   ├── report/page.tsx         # Leave reports
│   │   └── types-quotas/page.tsx   # Types & quotas
│   ├── app/[role]/admin-tools/
│   │   └── page.tsx                # Admin tools
│   ├── components/
│   │   └── toasts/
│   │       └── LeaveToast.tsx      # Leave notifications
│   ├── store/
│   │   └── api.ts                  # RTK Query API
│   └── config/sidenav/
│       └── page.tsx                # Navigation configuration
```

## 🔐 Authentication & Authorization

### JWT-Based Authentication
- Secure token-based authentication
- HTTP-only cookies for security
- Automatic token refresh
- Role-based route protection

### Role-Based Access Control
```javascript
// Middleware example
router.get('/team', authorize(['Manager']), leaveController.getTeamLeaveRequests);
router.put('/:id/role', authorize(['Admin']), userController.updateUserRole);
```

## 📊 Database Schema

### LeaveRequest Model
```javascript
{
  user: ObjectId,           // Reference to User
  leaveType: ObjectId,      // Reference to LeaveType
  startDate: Date,          // Leave start date
  endDate: Date,            // Leave end date
  days: Number,             // Calculated days
  reason: String,           // Leave reason
  status: String,           // pending/approved/rejected/cancelled
  approver: ObjectId,       // Reference to User (approver)
  comments: Array,          // Approval/rejection comments
  isHalfDay: Boolean        // Half-day flag
}
```

### LeaveQuota Model
```javascript
{
  user: ObjectId,           // Reference to User
  leaveType: ObjectId,      // Reference to LeaveType
  year: Number,             // Year for quota
  total: Number,            // Total allocated days
  used: Number              // Used days
}
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 5+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd OMS
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install

   # Frontend
   cd ../frontend
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Backend (.env)
   MONGODB_URI=mongodb://localhost:27017/oms
   JWT_SECRET=your_jwt_secret_key
   PORT=5000

   # Frontend (.env.local)
   NEXT_PUBLIC_BACKEND_API_BASE_URL=http://localhost:5000
   ```

4. **Start the application**
   ```bash
   # Backend
   cd backend
   npm run dev

   # Frontend
   cd frontend
   npm run dev
   ```

## 📱 Usage Guide

### For Employees
1. **Apply for Leave**: Navigate to "Apply for Leave" and fill the form
2. **Check Balance**: View your leave balance and remaining days
3. **Track Requests**: Monitor the status of your leave requests
4. **Cancel Requests**: Cancel pending requests if needed

### For Managers
1. **Team Management**: View and manage team member leave requests
2. **Approval Process**: Approve or reject requests with comments
3. **Personal Leave**: Access all employee features for personal leave

### For HR
1. **Leave Management**: Manage all employee leave requests
2. **Type Management**: Create and configure leave types
3. **Quota Management**: Set and adjust leave quotas
4. **Reporting**: Generate comprehensive leave reports

### For Admins
1. **System Management**: Access admin tools for system configuration
2. **User Management**: Manage user roles and permissions
3. **Full Access**: All HR and Manager capabilities

## 🔧 API Endpoints

### Leave Management
- `GET /api/leaves/balance` - Get user leave balance
- `GET /api/leaves/history` - Get user leave history
- `POST /api/leaves/apply` - Apply for leave
- `PATCH /api/leaves/cancel/:id` - Cancel leave request
- `GET /api/leaves/team` - Get team leave requests (Manager)
- `GET /api/leaves/requests` - Get all leave requests (HR/Admin)
- `PATCH /api/leaves/approve/:id` - Approve leave request
- `PATCH /api/leaves/reject/:id` - Reject leave request
- `GET /api/leaves/report` - Get leave reports

### Leave Types & Quotas
- `GET /api/leaves/types` - Get leave types
- `POST /api/leaves/types` - Create leave type
- `PATCH /api/leaves/types/:id` - Update leave type
- `DELETE /api/leaves/types/:id` - Delete leave type
- `GET /api/leaves/quotas` - Get leave quotas
- `POST /api/leaves/quotas` - Create leave quota
- `PATCH /api/leaves/quotas/:id` - Update leave quota

### User Management
- `PUT /api/users/:id/role` - Update user role (Admin only)

## 🎨 UI/UX Features

### Modern Design
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Consistent design system
- **Loading States**: Smooth loading indicators
- **Error Handling**: User-friendly error messages

### Interactive Elements
- **Status Indicators**: Color-coded status badges
- **Hover Effects**: Interactive hover states
- **Modal Dialogs**: Clean modal interfaces
- **Toast Notifications**: Real-time feedback

### Data Visualization
- **Statistics Cards**: Quick overview of key metrics
- **Data Tables**: Sortable and filterable tables
- **Progress Indicators**: Visual progress tracking
- **Charts & Graphs**: Data visualization (planned)

## 🔒 Security Features

### Authentication
- JWT token-based authentication
- Secure cookie storage
- Automatic token refresh
- Session management

### Authorization
- Role-based access control
- Route-level protection
- API endpoint security
- Data access restrictions

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 📈 Performance Optimization

### Frontend
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Caching strategies

### Backend
- Database indexing
- Query optimization
- Caching layers
- Rate limiting

## 🚀 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

### Environment Variables
Ensure all environment variables are properly configured for production.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for efficient office management** 