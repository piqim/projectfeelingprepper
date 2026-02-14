const Learnmore = () => {
  return (
    <div className="min-h-screen bg-neutral pb-20">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-gradient-to-r from-primary-light to-primary-base">
        <h1 className="text-highlight text-3xl font-bold montserrat-alternates">
          Learn More 🤔
        </h1>
      </div>

      {/* Info Cards Section */}
      <div className="px-6 py-6 space-y-6">
        {/* GRAPES Card */}
        <div className="bg-white rounded-2xl shadow-md border-4 border-secondary p-6">
          <div className="flex gap-3 mb-3 justify-center items-center">
            <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🍇</span>
            </div>
            <div className="flex-1 ">
              <h2 className="text-xl font-bold text-dark mb-2 montserrat-alternates">
                GRAPES
              </h2>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700 leading-relaxed mb-4">
            The GRAPES method is a simple behavioral activation tool commonly
            used in therapies like Cognitive Behavioral Therapy to help
            individuals structure their days in ways that support emotional
            well-being. GRAPES stands for <strong>G</strong>entle with self,{" "}
            <strong>R</strong>elaxation, <strong>A</strong>ccomplishment,{" "}
            <strong>P</strong>leasure, <strong>E</strong>xercise, and{" "}
            <strong>S</strong>ocial, encouraging people to intentionally
            incorporate at least one small activity from each category daily to
            reduce depression, anxiety, and burnout.
          </p>
          <a
            href="https://www.integritycounselinggroup.com/blog/2018/12/22/how-to-use-the-grapes-tool-daily-to-combat-depression"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-light text-sm font-semibold hover:text-primary-base transition-colors"
          >
            Read More
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>

        {/* Cognitive Triangle Card */}
        <div className="bg-white rounded-2xl shadow-md border-4 border-primary-light p-6">
          <div className="flex gap-3 mb-3 justify-center items-center">
            <div className="bg-primary-light rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl text-highlight">🔺</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-dark mb-2 montserrat-alternates">
                Cognitive Triangle
              </h2>
            </div>
          </div>
          <p className="text-lg font-semibold text-gray-700 leading-relaxed mb-4">
            The Cognitive Triangle, also central to Cognitive Behavioral
            Therapy, illustrates the interconnected relationship between
            thoughts, emotions, and behaviors, showing how a change in one
            component influences the others—for example, a negative thought can
            trigger distressing emotions and unhelpful behaviors, but reframing
            the thought can shift both feelings and actions. Together, these
            tools help individuals become more aware of patterns and actively
            intervene to improve mood and functioning.
          </p>
          <a
            href="https://hudsontherapygroup.com/blog/cognitive-triangle"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary-light text-sm font-semibold hover:text-primary-base transition-colors"
          >
            Read More
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </div>
      </div>

      {/* About Us Section */}
      <div className="bg-primary-light/10">
        <h2 className="px-6 pt-6 pb-2 text-dark text-3xl font-bold mb-4 montserrat-alternates">
          About Us
        </h2>
        <div className="bg-highlight font-semibold text-lg p-6">
          <p className="text-gray-700 leading-relaxed mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Duis aute irure dolor in reprehenderit in voluptate velit esse
            cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
            cupidatat non proident, sunt in culpa qui officia deserunt mollit
            anim id est laborum.
          </p>
        </div>
      </div>

      {/* Credits Section */}
      <div className="px-6 py-6">
        <h2 className="text-dark text-3xl font-bold mb-4 montserrat-alternates">
          Credits
        </h2>
        <div className="font-semibold text-lg mb-4">
          <p className="text-gray-700 leading-relaxed">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        <div className="space-y-4">

          {/* Credit 1 */}
          <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-accent-1">
            <div className="flex items-start justify-between gap-4 ">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-dark mb-1">
                  Mustaqim Bin Burhanuddin
                </h3>
                <p className="text-md font-medium text-gray-600 mb-2">
                  Lead Developer - Full-Stack Development & Architecture
                </p>
                <a
                  href="https://piqim.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-light text-sm font-semibold hover:text-primary-base transition-colors"
                >
                  Website
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
                <a
                  href="https://github.com/piqim"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center ml-2 gap-1 text-primary-light text-sm font-semibold hover:text-primary-base transition-colors"
                >
                  GitHub
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <div className="bg-accent-1/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👨‍💻</span>
              </div>
            </div>
          </div>

          {/* Credit 2 */}
          <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-secondary">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-dark mb-1">
                  Sen Chan
                </h3>
                <p className="text-md font-medium text-gray-600 mb-2">
                  Lead UI Designer - Interface Design & User Experience
                </p>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Link Unavailable
                </p>
              </div>
              <div className="bg-secondary/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          </div>

          {/* Credit 2.5 */}
          <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-primary-base">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-dark mb-1">
                  Fatihah Binti Burhanuddin
                </h3>
                <p className="text-md font-medium text-gray-600 mb-2">
                  UI Art Designer - Pet Character Design & Visual Assets
                </p>
                <p className="text-sm font-semibold text-gray-600 mb-2">
                  Link Unavailable
                </p>
              </div>
              <div className="bg-secondary/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🦭</span>
              </div>
            </div>
          </div>


          {/* Credit 3 */}
          <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-accent-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-dark mb-1">
                  Jessica Li
                </h3>
                <p className="text-md font-medium text-gray-600 mb-2">
                  Psychology Background Researcher - CBT Framework
                </p>
                <a
                  href="https://www.linkedin.com/in/jessicali2005/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-light text-sm font-semibold hover:text-primary-base transition-colors"
                >
                  LinkedIn
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <div className="bg-accent-3/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">👩‍⚕️</span>
              </div>
            </div>
          </div>

          {/* Credit 4 */}
          <div className="bg-white rounded-2xl shadow-md p-5 border-t-4 border-accent-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-dark mb-1">
                  Jaynie Schnell
                </h3>
                <p className="text-md font-medium text-gray-600 mb-2">
                  Clinical Psychology Researcher - Mental Health Content
                </p>
                <a
                  href="https://linkedin.com/in/jaynie-schnell-b88014240"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary-light text-sm font-semibold hover:text-primary-base transition-colors"
                >
                  LinkedIn
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
              <div className="bg-accent-2/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Learnmore;