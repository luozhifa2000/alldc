import { createBrowserRouter } from 'react-router';
import Layout from './components/Layout';
import Registration from './pages/Registration';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MomentDetail from './pages/MomentDetail';
import MomentEditor from './pages/MomentEditor';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: Login,
      },
      {
        path: 'register',
        Component: Registration,
      },
      {
        path: 'login',
        Component: Login,
      },
      {
        path: 'dashboard',
        Component: Dashboard,
      },
      {
        path: 'moment/:id',
        Component: MomentDetail,
      },
      {
        path: 'moment/new',
        Component: MomentEditor,
      },
    ],
  },
]);