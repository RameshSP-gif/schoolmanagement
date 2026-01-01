# School Management Mobile App

A comprehensive Expo React Native mobile application for school management with role-based access for Admin, Teacher, Student, Parent, and Staff.

## Features

### Authentication
- Login and Registration with role selection
- Secure token-based authentication with AsyncStorage
- Form validation and error handling
- Demo account quick access

### Admin Dashboard
- Statistics overview (Students, Teachers, Classes, Revenue)
- Student management (CRUD operations)
- Teacher management (CRUD operations)
- Class management (CRUD operations)
- Fee management
- Reports generation

### Teacher Features
- Dashboard with class overview
- My Classes list
- Assignment creation and management
- Attendance marking
- Grade management
- View student submissions

### Student Features
- Dashboard with personal stats
- My Courses view
- Assignment viewing and submission
- Grade tracking with progress indicators
- Attendance history
- Fee status and payment history

### Parent Features
- Dashboard with children overview
- Children list with details
- Child attendance tracking
- Child grades monitoring
- Child fee status
- Messages and notifications

### Staff Features
- Dashboard with daily overview
- Admissions management
- Fee collection tracking
- Visitor management system

## Technology Stack

- **Framework**: Expo SDK 50
- **Navigation**: Expo Router (File-based routing)
- **UI Components**: React Native Paper
- **State Management**: React Context API
- **API Client**: Axios
- **Storage**: AsyncStorage
- **TypeScript**: Full type safety
- **Styling**: React Native StyleSheet with Linear Gradients

## Project Structure

```
MobileApp/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Tab navigation
│   │   ├── index.tsx          # Dashboard (role-based)
│   │   ├── students.tsx       # Students screen (Admin)
│   │   ├── teachers.tsx       # Teachers screen (Admin)
│   │   ├── classes.tsx        # Classes screen (Admin/Teacher)
│   │   ├── assignments.tsx    # Assignments (Teacher/Student)
│   │   ├── attendance.tsx     # Attendance (Teacher/Parent)
│   │   ├── grades.tsx         # Grades (Student)
│   │   ├── fees.tsx           # Fees (Student/Parent/Staff)
│   │   ├── courses.tsx        # Courses (Student)
│   │   ├── children.tsx       # Children (Parent)
│   │   ├── admissions.tsx     # Admissions (Staff)
│   │   ├── visitors.tsx       # Visitors (Staff)
│   │   └── profile.tsx        # Profile (All roles)
│   ├── _layout.tsx            # Root layout
│   ├── login.tsx              # Login screen
│   └── register.tsx           # Register screen
├── src/
│   ├── components/
│   │   ├── StatCard.tsx       # Statistics card component
│   │   ├── Loading.tsx        # Loading indicator
│   │   ├── EmptyState.tsx     # Empty state component
│   │   ├── ErrorState.tsx     # Error state component
│   │   └── index.ts           # Component exports
│   ├── context/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── screens/
│   │   └── auth/
│   │       ├── LoginScreen.tsx
│   │       └── RegisterScreen.tsx
│   └── services/
│       ├── api.ts             # Axios configuration
│       ├── authService.ts     # Authentication API
│       ├── studentService.ts  # Student API
│       ├── teacherService.ts  # Teacher API
│       ├── classService.ts    # Class API
│       ├── feeService.ts      # Fee API
│       ├── assignmentService.ts # Assignment API
│       ├── attendanceService.ts # Attendance API
│       ├── gradeService.ts    # Grade API
│       └── index.ts           # Service exports
├── app.json                   # Expo configuration
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Studio (for Android development)

### Steps

1. **Clone the repository**
   ```bash
   cd c:\SchoolManagement\MobileApp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npx expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## Configuration

### API Endpoint Configuration

The app automatically configures the API URL based on your platform:

- **Android Emulator**: `http://10.0.2.2:5000/api` (automatically used)
- **iOS Simulator**: `http://localhost:5000/api` (automatically used)
- **Physical Device**: Update `src/config/api.config.ts` with your computer's IP

**For Physical Device Setup:**

1. Find your computer's IP address:
   ```bash
   # Windows
   ipconfig
   
   # Mac/Linux
   ifconfig
   ```

2. Edit `src/config/api.config.ts`:
   ```typescript
   const PHYSICAL_DEVICE_IP = 'YOUR_IP_HERE'; // e.g., 192.168.1.100
   ```

3. Uncomment this line:
   ```typescript
   return `http://${PHYSICAL_DEVICE_IP}:5000/api`;
   ```

4. Ensure your backend server listens on all interfaces:
   ```javascript
   app.listen(5000, '0.0.0.0', () => {
     console.log('Server running on port 5000');
   });
   ```

### Testing Connection

The login screen has a **"Test Connection"** button. Use it to verify backend connectivity before logging in.

## Demo Accounts

Quick access credentials for testing:

- **Admin**: admin@school.com / admin123
- **Teacher**: teacher@school.com / teacher123
- **Student**: student@school.com / student123
- **Parent**: parent@school.com / parent123
- **Staff**: staff@school.com / staff123

## Features by Role

### Admin
- View all statistics
- Manage students (add, edit, delete)
- Manage teachers (add, edit, delete)
- Manage classes (add, edit, delete)
- View and manage fees
- Generate reports

### Teacher
- View assigned classes
- Create and manage assignments
- Mark student attendance
- Enter and manage grades
- View student submissions

### Student
- View enrolled courses
- View and submit assignments
- Check grades and progress
- View attendance history
- Check fee status

### Parent
- View children's information
- Monitor children's attendance
- Track children's grades
- Check fee payments
- Receive notifications

### Staff
- Process new admissions
- Collect and manage fees
- Register and track visitors
- View daily reports

## Key Libraries

- **expo**: ~50.0.0
- **expo-router**: ~3.4.0
- **react-native-paper**: ^5.12.3
- **axios**: ^1.6.5
- **@react-native-async-storage/async-storage**: 1.21.0
- **expo-linear-gradient**: ~12.7.0
- **formik**: ^2.4.5
- **yup**: ^1.3.3

## Development

### Running Tests
```bash
npm test
```

### Building for Production

**iOS:**
```bash
npx expo build:ios
```

**Android:**
```bash
npx expo build:android
```

### EAS Build (Recommended)
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```

## API Integration

The app expects the following API endpoints:

- **Auth**: `/api/auth/login`, `/api/auth/register`
- **Students**: `/api/students`
- **Teachers**: `/api/teachers`
- **Classes**: `/api/classes`
- **Fees**: `/api/fees`
- **Assignments**: `/api/assignments`
- **Attendance**: `/api/attendance`
- **Grades**: `/api/grades`
- **Admissions**: `/api/admissions`
- **Visitors**: `/api/visitors`

## Styling

The app uses:
- React Native Paper for Material Design components
- Custom gradient themes for each role
- Responsive layouts
- Pull-to-refresh functionality
- Loading and error states

## Troubleshooting

### Login Not Working?

1. **Use the Test Connection button** on the login screen
2. Check the detailed [TROUBLESHOOTING.md](TROUBLESHOOTING.md) guide
3. Verify backend is running: `curl http://localhost:5000/api/health`

### Common Issues

**Android Emulator can't connect:**
- ✅ App automatically uses `10.0.2.2` (no changes needed)
- ✅ Restart with: `npx expo start -c`

**Physical Device can't connect:**
- ✅ Update IP in `src/config/api.config.ts`
- ✅ Ensure phone and computer on same Wi-Fi
- ✅ Backend must listen on `0.0.0.0` not just `localhost`

**"Network Error":**
- ✅ Check backend is running on port 5000
- ✅ Check firewall isn't blocking connections
- ✅ Use Test Connection button for detailed error

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for complete guide.

---

### Common Issues (Legacy)

1. **Metro bundler issues**
   ```bash
   npx expo start -c
   ```

2. **Dependencies not installing**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **iOS simulator not launching**
   ```bash
   npx expo run:ios
   ```

4. **Android build errors**
   ```bash
   cd android
   ./gradlew clean
   cd ..
   npx expo run:android
   ```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
- Create an issue in the repository
- Contact: support@schoolmanagement.com

## Roadmap

- [ ] Push notifications
- [ ] Offline mode support
- [ ] Document upload/download
- [ ] Chat/messaging system
- [ ] Calendar integration
- [ ] Biometric authentication
- [ ] Dark mode support
- [ ] Multi-language support

## Version History

### v1.0.0 (2026-01-01)
- Initial release
- Complete role-based navigation
- CRUD operations for all entities
- Authentication and authorization
- Responsive UI with React Native Paper
- API integration with backend

---

Made with ❤️ for educational institutions
