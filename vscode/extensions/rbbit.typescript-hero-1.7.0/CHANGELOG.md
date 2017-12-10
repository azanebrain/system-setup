# Change Log

## [1.7.0](https://github.com/buehler/typescript-hero/tree/1.7.0) (2017-10-31)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.6.0...1.7.0)

**Implemented enhancements:**

- feat: improved logging [\#323](https://github.com/buehler/typescript-hero/issues/323)
- Feature: Toggle remove import behavior [\#306](https://github.com/buehler/typescript-hero/issues/306)
- feat: Multi-Root support [\#283](https://github.com/buehler/typescript-hero/issues/283)

**Fixed bugs:**

- Import starting with double underscore is renamed by "organize imports" command [\#320](https://github.com/buehler/typescript-hero/issues/320)
- Imports being incorrectly removed by organizer [\#318](https://github.com/buehler/typescript-hero/issues/318)
- Organize import \<ctrl\>+\<alt\>+O removes imported functions [\#311](https://github.com/buehler/typescript-hero/issues/311)
- Type casting causes used imports to be removed [\#301](https://github.com/buehler/typescript-hero/issues/301)
- Imports are duplicated when using barrels  [\#208](https://github.com/buehler/typescript-hero/issues/208)

**Merged pull requests:**

- Release 2017-10-31 [\#330](https://github.com/buehler/typescript-hero/pull/330) ([buehler](https://github.com/buehler))
- chore: windows building and testing [\#329](https://github.com/buehler/typescript-hero/pull/329) ([buehler](https://github.com/buehler))
- fix: not removing default exports and indexer properties when used [\#328](https://github.com/buehler/typescript-hero/pull/328) ([buehler](https://github.com/buehler))
- fix: typescript parsings [\#327](https://github.com/buehler/typescript-hero/pull/327) ([buehler](https://github.com/buehler))
- Feat/logging and error handling [\#326](https://github.com/buehler/typescript-hero/pull/326) ([buehler](https://github.com/buehler))
- feat: multi root workspace support [\#325](https://github.com/buehler/typescript-hero/pull/325) ([buehler](https://github.com/buehler))

## [v1.6.0](https://github.com/buehler/typescript-hero/tree/v1.6.0) (2017-10-17)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.5.0...v1.6.0)

**Implemented enhancements:**

- Multi-imports being removed \(due to organizeOnSave\) [\#305](https://github.com/buehler/typescript-hero/issues/305)
- Outline doesn't include getters [\#257](https://github.com/buehler/typescript-hero/issues/257)
- feature: ES2015 default import \(and named import\) syntax [\#227](https://github.com/buehler/typescript-hero/issues/227)

**Merged pull requests:**

- Release 2017-10-17 [\#322](https://github.com/buehler/typescript-hero/pull/322) ([buehler](https://github.com/buehler))
- add configuration to disable remove unsed imports [\#315](https://github.com/buehler/typescript-hero/pull/315) ([danieloprado](https://github.com/danieloprado))
- feat\(document-outline\): show getters and setters in outline [\#314](https://github.com/buehler/typescript-hero/pull/314) ([buehler](https://github.com/buehler))
- feat\(parser\): Upgrade typescript parser and update default import generation [\#313](https://github.com/buehler/typescript-hero/pull/313) ([buehler](https://github.com/buehler))

## [v1.5.0](https://github.com/buehler/typescript-hero/tree/v1.5.0) (2017-09-19)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.4.2...v1.5.0)

**Implemented enhancements:**

- Feature Request: Preserve header location when organizing imports [\#216](https://github.com/buehler/typescript-hero/issues/216)
- Feature Request: Disable prompting for variable name [\#161](https://github.com/buehler/typescript-hero/issues/161)
- Enable setting to auto organize [\#150](https://github.com/buehler/typescript-hero/issues/150)

**Fixed bugs:**

- only organize imports in typescript / javascript files [\#293](https://github.com/buehler/typescript-hero/issues/293)
- Cannot read property 'length' of undefined [\#292](https://github.com/buehler/typescript-hero/issues/292)
- Plugin started using so much CPU that Mac OS creates kernel\_task for CPU not to overheat [\#271](https://github.com/buehler/typescript-hero/issues/271)
- File names with preceeding underscore are not properly imported [\#163](https://github.com/buehler/typescript-hero/issues/163)

**Merged pull requests:**

- Release 2017-09-19 [\#300](https://github.com/buehler/typescript-hero/pull/300) ([buehler](https://github.com/buehler))
- fix\(parser\): Fixating the typescript version to 2.4.2 [\#299](https://github.com/buehler/typescript-hero/pull/299) ([buehler](https://github.com/buehler))
- feat\(add-import\): add setting to disable prompting for aliases and default names [\#298](https://github.com/buehler/typescript-hero/pull/298) ([buehler](https://github.com/buehler))
- fix\(organize-imports\): don't add an empty newline [\#297](https://github.com/buehler/typescript-hero/pull/297) ([buehler](https://github.com/buehler))
- feat\(imports\): Respect file header comments or jsdocs [\#296](https://github.com/buehler/typescript-hero/pull/296) ([buehler](https://github.com/buehler))
- fix: disable organize command when not in a code file [\#295](https://github.com/buehler/typescript-hero/pull/295) ([buehler](https://github.com/buehler))
- feat\(imports\): Add organize on save via workspace hook [\#291](https://github.com/buehler/typescript-hero/pull/291) ([buehler](https://github.com/buehler))
- chore\(package-manager\): Change to yarn because of the lock files [\#289](https://github.com/buehler/typescript-hero/pull/289) ([buehler](https://github.com/buehler))

## [v1.4.2](https://github.com/buehler/typescript-hero/tree/v1.4.2) (2017-09-13)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.4.1...v1.4.2)

**Implemented enhancements:**

- Put lower priority for typeahead completion in property name [\#67](https://github.com/buehler/typescript-hero/issues/67)

**Fixed bugs:**

- ImportResolveExtension error. \(Possible yarn workspace issue?\) [\#284](https://github.com/buehler/typescript-hero/issues/284)
- organizeImports ignores imports used after the export statement [\#277](https://github.com/buehler/typescript-hero/issues/277)

**Merged pull requests:**

- Release 2017-09-13 [\#287](https://github.com/buehler/typescript-hero/pull/287) ([buehler](https://github.com/buehler))
- test: add tests for organize import beneath exports [\#286](https://github.com/buehler/typescript-hero/pull/286) ([buehler](https://github.com/buehler))
- fix\(packages\): Upgrade node parser to fix dir errors [\#285](https://github.com/buehler/typescript-hero/pull/285) ([buehler](https://github.com/buehler))
- Release 2017-09-11 [\#282](https://github.com/buehler/typescript-hero/pull/282) ([buehler](https://github.com/buehler))
- Merge master into dev [\#279](https://github.com/buehler/typescript-hero/pull/279) ([buehler](https://github.com/buehler))
- Add config setting to push import completions to the bottom of sugges… [\#276](https://github.com/buehler/typescript-hero/pull/276) ([asvetliakov](https://github.com/asvetliakov))

## [v1.4.1](https://github.com/buehler/typescript-hero/tree/v1.4.1) (2017-09-11)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.4.0...v1.4.1)

**Implemented enhancements:**

- Unable to exclude package from indexing if package is listed in package.json [\#274](https://github.com/buehler/typescript-hero/issues/274)

**Fixed bugs:**

- command 'typescriptHero.resolve.organizeImports' not found [\#273](https://github.com/buehler/typescript-hero/issues/273)
- Add import includes all types from node modules \(insiders edition\) [\#269](https://github.com/buehler/typescript-hero/issues/269)

**Closed issues:**

- resolve.add\*Import\* does not honor resolver.stringQuoteStyle  [\#270](https://github.com/buehler/typescript-hero/issues/270)

**Merged pull requests:**

- chore: add libsecret-1 to deps [\#280](https://github.com/buehler/typescript-hero/pull/280) ([buehler](https://github.com/buehler))
- Fix \#274 [\#275](https://github.com/buehler/typescript-hero/pull/275) ([asvetliakov](https://github.com/asvetliakov))

## [v1.4.0](https://github.com/buehler/typescript-hero/tree/v1.4.0) (2017-08-11)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.3.0...v1.4.0)

**Implemented enhancements:**

- Feature: ES Mode [\#262](https://github.com/buehler/typescript-hero/issues/262)

**Fixed bugs:**

- ignoreImportsForOrganize does not behave as expected [\#258](https://github.com/buehler/typescript-hero/issues/258)
- bug: tsx files are not updated when changed [\#255](https://github.com/buehler/typescript-hero/issues/255)

**Merged pull requests:**

- Release 2017-08-10 - 2 [\#266](https://github.com/buehler/typescript-hero/pull/266) ([buehler](https://github.com/buehler))
- Release 2017-08-10 [\#265](https://github.com/buehler/typescript-hero/pull/265) ([buehler](https://github.com/buehler))
- fix\(code-generation\): Imports with no specifiers are generated correctly [\#264](https://github.com/buehler/typescript-hero/pull/264) ([buehler](https://github.com/buehler))
- feat: add JavaScript mode to support javascript files for importing [\#263](https://github.com/buehler/typescript-hero/pull/263) ([buehler](https://github.com/buehler))
- fix\(imports\): tsx files not indexed on change [\#256](https://github.com/buehler/typescript-hero/pull/256) ([buehler](https://github.com/buehler))

## [v1.3.0](https://github.com/buehler/typescript-hero/tree/v1.3.0) (2017-07-15)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.2.1...v1.3.0)

**Fixed bugs:**

- Always used imports \(like react\) are removed during organize import [\#250](https://github.com/buehler/typescript-hero/issues/250)
- Code Outline is empty [\#234](https://github.com/buehler/typescript-hero/issues/234)
- Poor Intellisense Performance [\#231](https://github.com/buehler/typescript-hero/issues/231)
- Duplicate Imports [\#226](https://github.com/buehler/typescript-hero/issues/226)
- Detect imports that are used in tsx syntax -feature [\#186](https://github.com/buehler/typescript-hero/issues/186)
- Duplicate and Wrong Imports [\#175](https://github.com/buehler/typescript-hero/issues/175)
- Components generated using angular cli are not indexed unless changed manually [\#167](https://github.com/buehler/typescript-hero/issues/167)

**Closed issues:**

- feat: use long running task [\#246](https://github.com/buehler/typescript-hero/issues/246)

**Merged pull requests:**

- Release 2017-07-15 [\#254](https://github.com/buehler/typescript-hero/pull/254) ([buehler](https://github.com/buehler))
- fix\(imports\): duplicate imports are not generated anymore [\#253](https://github.com/buehler/typescript-hero/pull/253) ([buehler](https://github.com/buehler))
- fix\(imports\): ignore imports to remove [\#252](https://github.com/buehler/typescript-hero/pull/252) ([buehler](https://github.com/buehler))
- chore\(changelog\): fix version number [\#249](https://github.com/buehler/typescript-hero/pull/249) ([buehler](https://github.com/buehler))
- fix\(code completion\): Calculate text edits in a later stage [\#248](https://github.com/buehler/typescript-hero/pull/248) ([buehler](https://github.com/buehler))
- feat\(indexing\): use long running task to indicate progress [\#247](https://github.com/buehler/typescript-hero/pull/247) ([buehler](https://github.com/buehler))
- Hotfix 2017-07-12 [\#245](https://github.com/buehler/typescript-hero/pull/245) ([buehler](https://github.com/buehler))

## [v1.2.1](https://github.com/buehler/typescript-hero/tree/v1.2.1) (2017-07-12)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.2.0...v1.2.1)

**Fixed bugs:**

- Interaction with VSCode 1.14.0 bug [\#242](https://github.com/buehler/typescript-hero/issues/242)

**Merged pull requests:**

- fix\(general\): replace rootpath, add it to DI to minimize vscode logging [\#244](https://github.com/buehler/typescript-hero/pull/244) ([buehler](https://github.com/buehler))
- Chore/fix semantic release post [\#243](https://github.com/buehler/typescript-hero/pull/243) ([buehler](https://github.com/buehler))
- Release 2017-07-12 [\#241](https://github.com/buehler/typescript-hero/pull/241) ([buehler](https://github.com/buehler))

## [v1.2.0](https://github.com/buehler/typescript-hero/tree/v1.2.0) (2017-07-12)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.1.0...v1.2.0)

**Implemented enhancements:**

- Allow user to search within outline [\#225](https://github.com/buehler/typescript-hero/issues/225)

**Fixed bugs:**

- Code generator \(methods\) should add optional params [\#141](https://github.com/buehler/typescript-hero/issues/141)

**Merged pull requests:**

- chore\(release\): add semantic release [\#239](https://github.com/buehler/typescript-hero/pull/239) ([buehler](https://github.com/buehler))
- fix\(code outline\): Ensure missing icons [\#238](https://github.com/buehler/typescript-hero/pull/238) ([buehler](https://github.com/buehler))
- feat\(parser\): Change parser package and refactor extension [\#237](https://github.com/buehler/typescript-hero/pull/237) ([buehler](https://github.com/buehler))
- Removed code outline window when disabled per config. [\#236](https://github.com/buehler/typescript-hero/pull/236) ([Silvenga](https://github.com/Silvenga))
- Revert "Remove/code view" [\#235](https://github.com/buehler/typescript-hero/pull/235) ([buehler](https://github.com/buehler))
- Fix/implement interface or abstract [\#233](https://github.com/buehler/typescript-hero/pull/233) ([buehler](https://github.com/buehler))
- Remove/code view [\#232](https://github.com/buehler/typescript-hero/pull/232) ([buehler](https://github.com/buehler))

## [v1.1.0](https://github.com/buehler/typescript-hero/tree/v1.1.0) (2017-06-20)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v1.0.0...v1.1.0)

**Fixed bugs:**

- QuickFix Lightbulb not showing [\#160](https://github.com/buehler/typescript-hero/issues/160)
- Autocompletion doesn't work with decorators [\#111](https://github.com/buehler/typescript-hero/issues/111)
- Code outline does not jump in active editor [\#219](https://github.com/buehler/typescript-hero/issues/219)
- Organize import does not work when the regex contains @ or | [\#218](https://github.com/buehler/typescript-hero/issues/218)
- Triggering "Organize imports" ignores references encapsulated in namespace and throws them away. [\#214](https://github.com/buehler/typescript-hero/issues/214)

**Merged pull requests:**

- Release/1.1.0 [\#224](https://github.com/buehler/typescript-hero/pull/224) ([buehler](https://github.com/buehler))
- Fix/import group regex [\#223](https://github.com/buehler/typescript-hero/pull/223) ([buehler](https://github.com/buehler))
- Fix/resource usages organize imports [\#221](https://github.com/buehler/typescript-hero/pull/221) ([buehler](https://github.com/buehler))
- Fix/code outline not jumping to node [\#220](https://github.com/buehler/typescript-hero/pull/220) ([buehler](https://github.com/buehler))
- Feature/document structure view [\#217](https://github.com/buehler/typescript-hero/pull/217) ([buehler](https://github.com/buehler))

## [v1.0.0](https://github.com/buehler/typescript-hero/tree/v1.0.0) (2017-06-15)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.13.2...v1.0.0)

**Implemented enhancements:**

- Upgrade vscode dependencies [\#211](https://github.com/buehler/typescript-hero/issues/211)
- Refactoring of interface / class structure in TsDeclarations [\#136](https://github.com/buehler/typescript-hero/issues/136)
- Possibility to group and sort the imports of a document [\#102](https://github.com/buehler/typescript-hero/issues/102)
- Trailing comma for multi-line import setting [\#100](https://github.com/buehler/typescript-hero/issues/100)

**Fixed bugs:**

- Doesn't remove unused imports [\#205](https://github.com/buehler/typescript-hero/issues/205)
- Implement interface code help does not find generic interfaces [\#158](https://github.com/buehler/typescript-hero/issues/158)
- Organise imports removes too much [\#149](https://github.com/buehler/typescript-hero/issues/149)

**Merged pull requests:**

- Release/1.0.0 [\#213](https://github.com/buehler/typescript-hero/pull/213) ([buehler](https://github.com/buehler))
- Fix/upgrade vscode deps [\#212](https://github.com/buehler/typescript-hero/pull/212) ([buehler](https://github.com/buehler))
- Feature/awesome import manager [\#210](https://github.com/buehler/typescript-hero/pull/210) ([buehler](https://github.com/buehler))
- Fix/generic light bulb [\#209](https://github.com/buehler/typescript-hero/pull/209) ([buehler](https://github.com/buehler))
- Fix/organize removes too much [\#207](https://github.com/buehler/typescript-hero/pull/207) ([buehler](https://github.com/buehler))

## [v0.13.2](https://github.com/buehler/typescript-hero/tree/v0.13.2) (2017-06-06)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.13.1...v0.13.2)

**Fixed bugs:**

- ImportResolveExtension - There was an error during the build of the index. [\#194](https://github.com/buehler/typescript-hero/issues/194)

**Closed issues:**

- ImportResolveExtension - There was an error during reprocessing changed files [\#203](https://github.com/buehler/typescript-hero/issues/203)
- ImportResolveExtension - There was an error during the build of the index. [\#200](https://github.com/buehler/typescript-hero/issues/200)

**Merged pull requests:**

- Release/0.13.2 [\#206](https://github.com/buehler/typescript-hero/pull/206) ([buehler](https://github.com/buehler))
- Fix/error building index [\#202](https://github.com/buehler/typescript-hero/pull/202) ([buehler](https://github.com/buehler))
- Fix typo [\#201](https://github.com/buehler/typescript-hero/pull/201) ([domoritz](https://github.com/domoritz))

## [v0.13.1](https://github.com/buehler/typescript-hero/tree/v0.13.1) (2017-06-03)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.13.0...v0.13.1)

**Implemented enhancements:**

- Possibility to add imports "at the bottom of the imports" [\#97](https://github.com/buehler/typescript-hero/issues/97)

**Fixed bugs:**

- Crash when debugging extension [\#173](https://github.com/buehler/typescript-hero/issues/173)

**Merged pull requests:**

- Release/0.13.1 [\#199](https://github.com/buehler/typescript-hero/pull/199) ([buehler](https://github.com/buehler))
- Fix/server not able to index [\#198](https://github.com/buehler/typescript-hero/pull/198) ([buehler](https://github.com/buehler))
- feature launch.json [\#197](https://github.com/buehler/typescript-hero/pull/197) ([buehler](https://github.com/buehler))
- add launch.json file to ease extension testing and development [\#196](https://github.com/buehler/typescript-hero/pull/196) ([alexanderromanov](https://github.com/alexanderromanov))

## [v0.13.0](https://github.com/buehler/typescript-hero/tree/v0.13.0) (2017-06-01)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.12.0...v0.13.0)

**Implemented enhancements:**

- Remove unused imports without sorting [\#166](https://github.com/buehler/typescript-hero/issues/166)
- Feature Request: Weighted Ordering of potential imports [\#159](https://github.com/buehler/typescript-hero/issues/159)

**Fixed bugs:**

- if i use the typescript-hero,CPU utilization rate of more than 150% [\#185](https://github.com/buehler/typescript-hero/issues/185)
- Duplicate folder path for Angular-specific imports [\#178](https://github.com/buehler/typescript-hero/issues/178)
- Preserve case of file during auto indent [\#154](https://github.com/buehler/typescript-hero/issues/154)
- Force to import from barrel [\#107](https://github.com/buehler/typescript-hero/issues/107)
- issue while importing some ts2 @types typings [\#104](https://github.com/buehler/typescript-hero/issues/104)
- High load in extension host [\#143](https://github.com/buehler/typescript-hero/issues/143)

**Closed issues:**

- Make quotation marks being used configurable [\#180](https://github.com/buehler/typescript-hero/issues/180)
- Spaces still inserted around imports even when disabled in settings [\#179](https://github.com/buehler/typescript-hero/issues/179)
- Extension host terminated unexpectedly. Please reload the window to recover. [\#171](https://github.com/buehler/typescript-hero/issues/171)
- \[FEATURE REQUEST\] Setting to disable tool-tip import suggestions from appearing while typing. [\#165](https://github.com/buehler/typescript-hero/issues/165)

**Merged pull requests:**

- Release/0.13.0 [\#193](https://github.com/buehler/typescript-hero/pull/193) ([buehler](https://github.com/buehler))
- Docs/cleanup and documentation [\#191](https://github.com/buehler/typescript-hero/pull/191) ([buehler](https://github.com/buehler))
- Runs del using yarn explicitly to avoid issues when building with Windows [\#190](https://github.com/buehler/typescript-hero/pull/190) ([GunnarHolwerda](https://github.com/GunnarHolwerda))
- Fix/cleanup rewrite [\#189](https://github.com/buehler/typescript-hero/pull/189) ([buehler](https://github.com/buehler))
- Feature/rework extension [\#188](https://github.com/buehler/typescript-hero/pull/188) ([buehler](https://github.com/buehler))
- 178 duplicate folder path for angular specific imports [\#187](https://github.com/buehler/typescript-hero/pull/187) ([GunnarHolwerda](https://github.com/GunnarHolwerda))
- \#166 make imports sorting optional during organize imports [\#184](https://github.com/buehler/typescript-hero/pull/184) ([grzegorz-jazurek](https://github.com/grzegorz-jazurek))
- typo [\#183](https://github.com/buehler/typescript-hero/pull/183) ([Piliponful](https://github.com/Piliponful))
- Imports from newly added tsx files aren't seen by resolver [\#169](https://github.com/buehler/typescript-hero/pull/169) ([dpoineau](https://github.com/dpoineau))
- Update .travis.yml [\#162](https://github.com/buehler/typescript-hero/pull/162) ([buehler](https://github.com/buehler))

## [v0.12.0](https://github.com/buehler/typescript-hero/tree/v0.12.0) (2017-01-03)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.11.0...v0.12.0)

**Implemented enhancements:**

- Make end-of-line semicolon emit configurable [\#146](https://github.com/buehler/typescript-hero/issues/146)
- Generator extension [\#9](https://github.com/buehler/typescript-hero/issues/9)
- Upgrade code to TS2.1 [\#148](https://github.com/buehler/typescript-hero/issues/148)
- Upgrade code to TS2.1 [\#148](https://github.com/buehler/typescript-hero/issues/148)

**Fixed bugs:**

- Auto import for `console`?! [\#99](https://github.com/buehler/typescript-hero/issues/99)
- overloaded function is shown multiple times \(one per overload\) [\#105](https://github.com/buehler/typescript-hero/issues/105)
- npm module typings mentioned in package.json are not picked up [\#103](https://github.com/buehler/typescript-hero/issues/103)
- Can't run any of the commands [\#79](https://github.com/buehler/typescript-hero/issues/79)

**Closed issues:**

- Ignore certain folders for imports [\#144](https://github.com/buehler/typescript-hero/issues/144)

**Merged pull requests:**

- Release/0.12.0 [\#157](https://github.com/buehler/typescript-hero/pull/157) ([buehler](https://github.com/buehler))
- Fix/ext crash [\#156](https://github.com/buehler/typescript-hero/pull/156) ([buehler](https://github.com/buehler))
- Fix/build index [\#153](https://github.com/buehler/typescript-hero/pull/153) ([buehler](https://github.com/buehler))
- Fix/console-log-import [\#152](https://github.com/buehler/typescript-hero/pull/152) ([buehler](https://github.com/buehler))
- Feature/upgrade ts [\#151](https://github.com/buehler/typescript-hero/pull/151) ([buehler](https://github.com/buehler))
- Feature/add setting to configure semicolon insertion [\#147](https://github.com/buehler/typescript-hero/pull/147) ([jbbr](https://github.com/jbbr))
- Fix/missing declarations - duplicate declarations [\#138](https://github.com/buehler/typescript-hero/pull/138) ([buehler](https://github.com/buehler))

## [v0.11.0](https://github.com/buehler/typescript-hero/tree/v0.11.0) (2016-12-03)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.10.1...v0.11.0)

**Implemented enhancements:**

- Light bulb support for tsx files [\#128](https://github.com/buehler/typescript-hero/issues/128)
- Refactor DocumentController and implement Class Manager [\#127](https://github.com/buehler/typescript-hero/issues/127)
- Add implement interface functionality [\#114](https://github.com/buehler/typescript-hero/issues/114)

**Merged pull requests:**

- Release/0.11.0 [\#135](https://github.com/buehler/typescript-hero/pull/135) ([buehler](https://github.com/buehler))
- Feature/implement interface [\#134](https://github.com/buehler/typescript-hero/pull/134) ([buehler](https://github.com/buehler))
- add lightbulb [\#133](https://github.com/buehler/typescript-hero/pull/133) ([buehler](https://github.com/buehler))
- Feature/refactor document manager [\#131](https://github.com/buehler/typescript-hero/pull/131) ([buehler](https://github.com/buehler))

## [v0.10.1](https://github.com/buehler/typescript-hero/tree/v0.10.1) (2016-11-18)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.10.0...v0.10.1)

**Implemented enhancements:**

- Respect usual semantic import groups [\#82](https://github.com/buehler/typescript-hero/issues/82)
- Respect usual semantic import groups [\#82](https://github.com/buehler/typescript-hero/issues/82)
- Respect comments between imports [\#80](https://github.com/buehler/typescript-hero/issues/80)

**Fixed bugs:**

- The gui command can't show after closing while active [\#122](https://github.com/buehler/typescript-hero/issues/122)
- Can't cancel actions [\#121](https://github.com/buehler/typescript-hero/issues/121)
- Won't import, no errors [\#117](https://github.com/buehler/typescript-hero/issues/117)

**Merged pull requests:**

- Release/0.10.1 [\#126](https://github.com/buehler/typescript-hero/pull/126) ([buehler](https://github.com/buehler))
- Fix/cannot cancel import missing [\#125](https://github.com/buehler/typescript-hero/pull/125) ([buehler](https://github.com/buehler))
- Fix/light bulb errors [\#124](https://github.com/buehler/typescript-hero/pull/124) ([buehler](https://github.com/buehler))

## [v0.10.0](https://github.com/buehler/typescript-hero/tree/v0.10.0) (2016-11-12)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.9.0...v0.10.0)

**Implemented enhancements:**

- Feature: add all missing imports [\#106](https://github.com/buehler/typescript-hero/issues/106)
- Code Action provider [\#11](https://github.com/buehler/typescript-hero/issues/11)

**Fixed bugs:**

- Cannot build index on windows [\#110](https://github.com/buehler/typescript-hero/issues/110)
- Causes VS Code to crash when running npm install from terminal. [\#86](https://github.com/buehler/typescript-hero/issues/86)

**Merged pull requests:**

- Release/0.10.0 [\#120](https://github.com/buehler/typescript-hero/pull/120) ([buehler](https://github.com/buehler))
- Fix/endless recursion on parsing [\#119](https://github.com/buehler/typescript-hero/pull/119) ([buehler](https://github.com/buehler))
- Feature/add all missing command [\#118](https://github.com/buehler/typescript-hero/pull/118) ([buehler](https://github.com/buehler))
- Feature/code action provider [\#116](https://github.com/buehler/typescript-hero/pull/116) ([buehler](https://github.com/buehler))
- Update README.md [\#115](https://github.com/buehler/typescript-hero/pull/115) ([cyrilgandon](https://github.com/cyrilgandon))
- Feature/document manager [\#113](https://github.com/buehler/typescript-hero/pull/113) ([buehler](https://github.com/buehler))
- Initialize extension and completion provider for typescriptreact [\#112](https://github.com/buehler/typescript-hero/pull/112) ([asvetliakov](https://github.com/asvetliakov))
- Feature/testing the next [\#109](https://github.com/buehler/typescript-hero/pull/109) ([buehler](https://github.com/buehler))
- Feature/testing [\#108](https://github.com/buehler/typescript-hero/pull/108) ([buehler](https://github.com/buehler))

## [v0.9.0](https://github.com/buehler/typescript-hero/tree/v0.9.0) (2016-10-14)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.8.0...v0.9.0)

**Implemented enhancements:**

- organize imports: import non imported types [\#6](https://github.com/buehler/typescript-hero/issues/6)
- Upgrade to TS2.0 [\#88](https://github.com/buehler/typescript-hero/issues/88)
- Add statusbar indicator for debug restarter [\#85](https://github.com/buehler/typescript-hero/issues/85)
- Support @types of TS2.0 [\#77](https://github.com/buehler/typescript-hero/issues/77)
- Support @types of TS2.0 [\#77](https://github.com/buehler/typescript-hero/issues/77)
- Remove the need to restart VS Code when typescriptHero.resolver.ignorePatterns setting is changed. [\#75](https://github.com/buehler/typescript-hero/issues/75)
- Multiline imports must respect indentation settings [\#74](https://github.com/buehler/typescript-hero/issues/74)
- Default import should suggest name \(if any is provided\) [\#71](https://github.com/buehler/typescript-hero/issues/71)

**Fixed bugs:**

- Can I opt-out of TypeScript-Hero displaying absolute paths in module suggestion list? [\#76](https://github.com/buehler/typescript-hero/issues/76)
- Remove the need to restart VS Code when typescriptHero.resolver.ignorePatterns setting is changed. [\#75](https://github.com/buehler/typescript-hero/issues/75)
- Multiline imports must respect indentation settings [\#74](https://github.com/buehler/typescript-hero/issues/74)
- New import location at the top of the file is not what expected. [\#73](https://github.com/buehler/typescript-hero/issues/73)
- Autocomplete fires on "." [\#69](https://github.com/buehler/typescript-hero/issues/69)

**Closed issues:**

- Import from exports [\#90](https://github.com/buehler/typescript-hero/issues/90)

**Merged pull requests:**

- Release/0.9.0 [\#96](https://github.com/buehler/typescript-hero/pull/96) ([buehler](https://github.com/buehler))
- Fix/root index exports [\#95](https://github.com/buehler/typescript-hero/pull/95) ([buehler](https://github.com/buehler))
- Fix/absolute windows pathes [\#94](https://github.com/buehler/typescript-hero/pull/94) ([buehler](https://github.com/buehler))
- Fix/non named exports [\#93](https://github.com/buehler/typescript-hero/pull/93) ([buehler](https://github.com/buehler))
- Feature/ts 2 [\#92](https://github.com/buehler/typescript-hero/pull/92) ([buehler](https://github.com/buehler))
- Fix/autocomplete fires on dot [\#91](https://github.com/buehler/typescript-hero/pull/91) ([buehler](https://github.com/buehler))
- Feature/debugger status icon [\#89](https://github.com/buehler/typescript-hero/pull/89) ([buehler](https://github.com/buehler))
- Feature/node positions in declarations [\#87](https://github.com/buehler/typescript-hero/pull/87) ([buehler](https://github.com/buehler))
- Fix/resolver ignore patterns refresh [\#84](https://github.com/buehler/typescript-hero/pull/84) ([buehler](https://github.com/buehler))
- Fix/wrong import when use strict [\#81](https://github.com/buehler/typescript-hero/pull/81) ([buehler](https://github.com/buehler))
- Fix/indentation spaces [\#78](https://github.com/buehler/typescript-hero/pull/78) ([buehler](https://github.com/buehler))

## [v0.8.0](https://github.com/buehler/typescript-hero/tree/v0.8.0) (2016-09-24)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.7.1...v0.8.0)

**Implemented enhancements:**

- Refactor `asRelativePath` logic [\#33](https://github.com/buehler/typescript-hero/issues/33)
- Support multiline imports [\#60](https://github.com/buehler/typescript-hero/issues/60)
- Ask for alias name if specifier is duplicate [\#44](https://github.com/buehler/typescript-hero/issues/44)
- Configurable space where imports are written [\#41](https://github.com/buehler/typescript-hero/issues/41)

**Fixed bugs:**

- Module ... resolves to a non-module function [\#54](https://github.com/buehler/typescript-hero/issues/54)
- Autocomplete suggests already imported symbols [\#64](https://github.com/buehler/typescript-hero/issues/64)
- Autocomplete creates import for current file/class [\#61](https://github.com/buehler/typescript-hero/issues/61)
- Generates `Duplicate Identifier` for already imported stuff via multiline import [\#43](https://github.com/buehler/typescript-hero/issues/43)

**Closed issues:**

- React/tsx support [\#62](https://github.com/buehler/typescript-hero/issues/62)

**Merged pull requests:**

- Release/0.8.0 [\#72](https://github.com/buehler/typescript-hero/pull/72) ([buehler](https://github.com/buehler))
- Feature/alias for duplicate specifiers [\#70](https://github.com/buehler/typescript-hero/pull/70) ([buehler](https://github.com/buehler))
- Feature/configurable import location [\#68](https://github.com/buehler/typescript-hero/pull/68) ([buehler](https://github.com/buehler))
- Feature/multiline imports [\#66](https://github.com/buehler/typescript-hero/pull/66) ([buehler](https://github.com/buehler))
- Fix/autocomplete [\#65](https://github.com/buehler/typescript-hero/pull/65) ([buehler](https://github.com/buehler))

## [v0.7.1](https://github.com/buehler/typescript-hero/tree/v0.7.1) (2016-09-21)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.7.0...v0.7.1)

**Fixed bugs:**

- Code completion not showing in default vscode completion [\#55](https://github.com/buehler/typescript-hero/issues/55)
- Newly created file not indexed [\#46](https://github.com/buehler/typescript-hero/issues/46)
- Default exports / imports are not working [\#40](https://github.com/buehler/typescript-hero/issues/40)

**Merged pull requests:**

- Release/0.7.1 [\#59](https://github.com/buehler/typescript-hero/pull/59) ([buehler](https://github.com/buehler))
- Fix/file not indexed [\#58](https://github.com/buehler/typescript-hero/pull/58) ([buehler](https://github.com/buehler))
- Fix/default imports [\#57](https://github.com/buehler/typescript-hero/pull/57) ([buehler](https://github.com/buehler))
- Fix/code completion not showing [\#56](https://github.com/buehler/typescript-hero/pull/56) ([buehler](https://github.com/buehler))

## [v0.7.0](https://github.com/buehler/typescript-hero/tree/v0.7.0) (2016-09-15)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.6.0...v0.7.0)

**Implemented enhancements:**

- Not working in tsx files [\#42](https://github.com/buehler/typescript-hero/issues/42)
- Testing [\#8](https://github.com/buehler/typescript-hero/issues/8)
- Testing [\#8](https://github.com/buehler/typescript-hero/issues/8)
- add typeahead provider [\#5](https://github.com/buehler/typescript-hero/issues/5)
- WIP: Feature/code completion provider [\#45](https://github.com/buehler/typescript-hero/pull/45) ([buehler](https://github.com/buehler))

**Fixed bugs:**

- don't import from index if current file is in subfolder [\#49](https://github.com/buehler/typescript-hero/issues/49)
- Built items are in index \(d.ts files in build results\) [\#48](https://github.com/buehler/typescript-hero/issues/48)
- Ctrl+Alt+i show long list of paths [\#37](https://github.com/buehler/typescript-hero/issues/37)
- Aliases are not correctly indexed [\#36](https://github.com/buehler/typescript-hero/issues/36)
- Import assist using backslash \ not forwardslash / [\#19](https://github.com/buehler/typescript-hero/issues/19)

**Merged pull requests:**

- Fix/wrong index in subfolder [\#53](https://github.com/buehler/typescript-hero/pull/53) ([buehler](https://github.com/buehler))
- Feature/support tsx files [\#52](https://github.com/buehler/typescript-hero/pull/52) ([buehler](https://github.com/buehler))
- Fix/built items in index [\#51](https://github.com/buehler/typescript-hero/pull/51) ([buehler](https://github.com/buehler))
- Feature/more testing [\#50](https://github.com/buehler/typescript-hero/pull/50) ([buehler](https://github.com/buehler))
- Fix/export alias [\#47](https://github.com/buehler/typescript-hero/pull/47) ([buehler](https://github.com/buehler))
- Fix/infinite import list [\#39](https://github.com/buehler/typescript-hero/pull/39) ([buehler](https://github.com/buehler))
- Fix/windows slashes [\#38](https://github.com/buehler/typescript-hero/pull/38) ([buehler](https://github.com/buehler))
- Import exact match [\#35](https://github.com/buehler/typescript-hero/pull/35) ([n00dl3](https://github.com/n00dl3))

## [v0.6.0](https://github.com/buehler/typescript-hero/tree/v0.6.0) (2016-09-09)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.5.4...v0.6.0)

**Implemented enhancements:**

- Import should not organize by default [\#23](https://github.com/buehler/typescript-hero/issues/23)
- Feature/core rewrite [\#28](https://github.com/buehler/typescript-hero/pull/28) ([buehler](https://github.com/buehler))

**Fixed bugs:**

- Some imports vanish during organize imports [\#30](https://github.com/buehler/typescript-hero/issues/30)
- Organize import removes imports if they are used in property assignment [\#27](https://github.com/buehler/typescript-hero/issues/27)
- import symbol exported via "export \* from..." [\#25](https://github.com/buehler/typescript-hero/issues/25)

**Closed issues:**

- don't reorganise my imports on "add import" + add import at cursor position [\#22](https://github.com/buehler/typescript-hero/issues/22)
- select quote format [\#21](https://github.com/buehler/typescript-hero/issues/21)

**Merged pull requests:**

- Release/v0.6.0 [\#34](https://github.com/buehler/typescript-hero/pull/34) ([buehler](https://github.com/buehler))
- Fix/vanishing imports [\#32](https://github.com/buehler/typescript-hero/pull/32) ([buehler](https://github.com/buehler))
- adding documentation [\#31](https://github.com/buehler/typescript-hero/pull/31) ([buehler](https://github.com/buehler))
- fix check for undefined [\#29](https://github.com/buehler/typescript-hero/pull/29) ([buehler](https://github.com/buehler))
- Recursively process export \* from and so on... [\#26](https://github.com/buehler/typescript-hero/pull/26) ([n00dl3](https://github.com/n00dl3))
- import symbol under cursor [\#24](https://github.com/buehler/typescript-hero/pull/24) ([n00dl3](https://github.com/n00dl3))

## [v0.5.4](https://github.com/buehler/typescript-hero/tree/v0.5.4) (2016-08-22)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.5.3...v0.5.4)

**Implemented enhancements:**

- Extend command gui [\#4](https://github.com/buehler/typescript-hero/issues/4)
- Use import destructuring spacing config option [\#17](https://github.com/buehler/typescript-hero/pull/17) ([isaacplmann](https://github.com/isaacplmann))

**Fixed bugs:**

- Typings files produce duplicated entries [\#3](https://github.com/buehler/typescript-hero/issues/3)

**Merged pull requests:**

- release 0.5.4 [\#20](https://github.com/buehler/typescript-hero/pull/20) ([buehler](https://github.com/buehler))
- Fix/refactorings [\#18](https://github.com/buehler/typescript-hero/pull/18) ([buehler](https://github.com/buehler))
- Feature/completion item provider [\#15](https://github.com/buehler/typescript-hero/pull/15) ([buehler](https://github.com/buehler))
- Fix/double entries [\#13](https://github.com/buehler/typescript-hero/pull/13) ([buehler](https://github.com/buehler))

## [v0.5.3](https://github.com/buehler/typescript-hero/tree/v0.5.3) (2016-08-08)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.5.2...v0.5.3)

## [v0.5.2](https://github.com/buehler/typescript-hero/tree/v0.5.2) (2016-08-08)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.5.1...v0.5.2)

## [v0.5.1](https://github.com/buehler/typescript-hero/tree/v0.5.1) (2016-08-08)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.5.0...v0.5.1)

## [v0.5.0](https://github.com/buehler/typescript-hero/tree/v0.5.0) (2016-08-08)
[Full Changelog](https://github.com/buehler/typescript-hero/compare/v0.4.0...v0.5.0)

**Implemented enhancements:**

- Extension output channel [\#2](https://github.com/buehler/typescript-hero/issues/2)

**Merged pull requests:**

- Release/0.5.0 [\#12](https://github.com/buehler/typescript-hero/pull/12) ([buehler](https://github.com/buehler))
- adding more commands [\#10](https://github.com/buehler/typescript-hero/pull/10) ([buehler](https://github.com/buehler))
- Feature/error logging [\#7](https://github.com/buehler/typescript-hero/pull/7) ([buehler](https://github.com/buehler))

## [v0.4.0](https://github.com/buehler/typescript-hero/tree/v0.4.0) (2016-08-05)
**Merged pull requests:**

- Feature/base ext [\#1](https://github.com/buehler/typescript-hero/pull/1) ([buehler](https://github.com/buehler))



\* *This Change Log was automatically generated by [github_changelog_generator](https://github.com/skywinder/Github-Changelog-Generator)*