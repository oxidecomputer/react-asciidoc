const listing = `
// // .basic
// ----
// echo -n "Please enter your name: "
// read name
// echo "Hello, $name!"
// ----
//
// // .basic-with-title
// .Reading user input
// ----
// echo -n "Please enter your name: "
// read name
// echo "Hello, $name!"
// ----
//
// // .basic-nowrap
// [options="nowrap"]
// ----
// ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
// ----
//
// // .basic-with-id-and-role
// [#code.example]
// ----
// echo -n "Please enter your name: "
// read name
// echo "Hello, $name!"
// ----
//
// // .source
// [source]
// ----
// 5.times do
//   print "Odelay!"
// end
// ----
//
// // .source-with-title
// [source]
// .Odelay!
// ----
// 5.times do
//   print "Odelay!"
// end
// ----
//
// // .source-with-language
// [source, ruby]
// ----
// 5.times do
//   print "Odelay!"
// end
// ----
//
// // .source-nowrap
// [source, java, options="nowrap"]
// ----
// public class ApplicationConfigurationProvider extends HttpConfigurationProvider {
//
//    public Configuration getConfiguration(ServletContext context) {
//       return ConfigurationBuilder.begin()
//                .addRule()
//                .when(Direction.isInbound().and(Path.matches("/{path}")))
//                .perform(Log.message(Level.INFO, "Client requested path: {path}"))
//                .where("path").matches(".*");
//    }
// }
// ----
// `

export default listing
