import { Canvas, Flex, Space, Title } from "../view/ui"
import { ShapeStrideVisualizer } from "./ShapeStrideVisualizer"
import { Link as LinkRoute } from "./Routes"

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom"
import { ExprIdxVisualizer } from "./ExprIdxVisualizer"

enum ROUTES {
  BASE = "/shape-stride-visualizer",
  SHAPE_STRIDE_VISUALIZER = "/shape-stride",
  EXPR_IDX_VISUALIZER = "/expr-idx",
}

const AppRoutes = () => {
  return (
    <div>
      <LinkRoute to="/">
        <AppTitle />
      </LinkRoute>

      <Space size={10} />
      <Flex justify="flex-start" gap="large" align="center">
        <GithubLink />
        <LinkRoute to={ROUTES.SHAPE_STRIDE_VISUALIZER}>
          Shape Stride Visualizer
        </LinkRoute>
        <LinkRoute to={ROUTES.EXPR_IDX_VISUALIZER}>
          Expr Idx Visualizer
        </LinkRoute>
      </Flex>
    </div>
  )
}

const MainAppRouter: React.FC<{}> = () => {
  return (
    <Router basename={ROUTES.BASE}>
      <AppRoutes />
      <Switch>
        <Route exact path="/">
          <Redirect to={ROUTES.SHAPE_STRIDE_VISUALIZER} />
        </Route>
        <Route path={ROUTES.SHAPE_STRIDE_VISUALIZER}>
          <ShapeStrideVisualizer />
        </Route>
        <Route path={ROUTES.EXPR_IDX_VISUALIZER}>
          <ExprIdxVisualizer />
        </Route>
        <Route path="*">
          <div>
            <h1>Page not found</h1>
          </div>
        </Route>
      </Switch>
    </Router>
  )
}

const AppTitle = () => <Title level={1}>Shape and stride visualizer</Title>
const GithubLink = () => (
  <LinkRoute
    to="https://github.com/mesozoic-egg/shape-stride-visualizer"
    htmlLink
    newTab
  >
    Github Link
  </LinkRoute>
)
interface MainAppProps {}
export const MainApp: React.FC<MainAppProps> = () => {
  return (
    <Canvas maxWidth={1000}>
      <MainAppRouter />
      <Space size={100} />
    </Canvas>
  )
}
