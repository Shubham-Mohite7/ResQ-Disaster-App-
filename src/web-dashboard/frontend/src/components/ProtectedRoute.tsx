
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children
}) => {
  // Authentication bypassed - direct access to admin panel
  return <>{children}</>;
};

export default ProtectedRoute;
