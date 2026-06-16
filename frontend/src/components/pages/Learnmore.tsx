const Learnmore = () => {
  return (
    <div className="min-h-dvh bg-neutral pb-32">
      {/* Header */}
      {/*<div className="bg-primary-light p-4 text-center">
        <h1 className="text-2xl font-bold text-highlight montserrat-alternates">
          Learn More
        </h1>
      </div>*/}

      {/* Info Cards Section */}
      <div className="px-6 py-6 space-y-6">
        {/* Crisis Resources Card — surfaced first so help is never buried. */}
        <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl shadow-md border-4 border-red-400 dark:border-red-500/40 p-6">
          <div className="flex gap-3 mb-3 justify-center items-center">
            <div className="bg-red-500 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🆘</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink mb-1 montserrat-alternates">
                In Crisis? Get Help Now
              </h2>
            </div>
          </div>
          <p className="text-base font-semibold text-ink leading-relaxed mb-4">
            FeelingPrepper is a self-help tool, not a substitute for professional
            care. If you are in emotional distress or thinking about self-harm,
            please reach out right away — you deserve support.
          </p>
          <div className="space-y-2">
            <a
              href="tel:988"
              className="flex items-center justify-between bg-surface rounded-xl p-3 font-semibold text-ink hover:bg-surface-2 transition-colors"
            >
              <span>📞 988 — Suicide &amp; Crisis Lifeline</span>
              <span className="text-primary-light text-sm">Call</span>
            </a>
            <a
              href="sms:741741?body=HOME"
              className="flex items-center justify-between bg-surface rounded-xl p-3 font-semibold text-ink hover:bg-surface-2 transition-colors"
            >
              <span>💬 Text HOME to 741741</span>
              <span className="text-primary-light text-sm">Text</span>
            </a>
            <a
              href="tel:911"
              className="flex items-center justify-between bg-surface rounded-xl p-3 font-semibold text-ink hover:bg-surface-2 transition-colors"
            >
              <span>🚨 911 — Emergency</span>
              <span className="text-primary-light text-sm">Call</span>
            </a>
          </div>
          <p className="text-xs text-muted mt-3 leading-relaxed">
            988 and 911 are US numbers. If you are outside the US, contact your
            local emergency services or a crisis line in your country.
          </p>
        </div>

        {/* GRAPES Card */}
        <div className="bg-surface rounded-2xl shadow-md border-4 border-secondary p-6">
          <div className="flex gap-3 mb-3 justify-center items-center">
            <div className="bg-secondary rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🍇</span>
            </div>
            <div className="flex-1 ">
              <h2 className="text-xl font-bold text-ink mb-2 montserrat-alternates">
                GRAPES
              </h2>
            </div>
          </div>
          <p className="text-lg font-semibold text-ink leading-relaxed mb-4">
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
        <div className="bg-surface rounded-2xl shadow-md border-4 border-primary-light p-6">
          <div className="flex gap-3 mb-3 justify-center items-center">
            <div className="bg-primary-light rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl text-highlight">🔺</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-ink mb-2 montserrat-alternates">
                Cognitive Triangle
              </h2>
            </div>
          </div>
          <p className="text-lg font-semibold text-ink leading-relaxed mb-4">
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
        <h2 className="px-6 pt-6 pb-2 text-ink text-3xl font-bold mb-4 montserrat-alternates">
          About Us
        </h2>
        <div className="bg-highlight dark:bg-surface font-semibold text-lg p-6">
          <p className="text-ink leading-relaxed mb-4">
            My name is Piqim, and I am a software developer with a passion for mental health and well-being. I created this app to provide a simple, engaging way for people to practice evidence-based techniques like GRAPES and the Cognitive Triangle in their daily lives. My hope is that by making these tools more accessible and fun, I can help others improve their mental health and find moments of joy and accomplishment every day.
          </p>
          <p className="text-ink leading-relaxed">
            I started planning the development of the app in early September of 2025, along with my friends and I. The idea stemmed from therapist, Dr. Hyke whom suggested me to practice GRAPES and the Cognitive Triangle in my daily life to help with my mental health. I found it difficult to keep up with the practices, and thus I wanted to create an app that would make it easier and more enjoyable for myself and others to stay consistent with these techniques.
          </p>
        </div>
      </div>

      {/* Credits Section */}
      <div className="px-6 py-6">
        <h2 className="text-ink text-3xl font-bold mb-4 montserrat-alternates">
          Credits
        </h2>
        <div className="font-semibold text-lg mb-4">
          <p className="text-ink leading-relaxed">
            These are the friends, and family who have contributed to the development of this app in various ways, from coding and design to research and content creation. I am incredibly grateful for their support and expertise, which have been invaluable in bringing this project to life.
          </p>
        </div>

        <div className="space-y-4">

          {/* Credit 1 */}
          <div className="bg-surface rounded-2xl shadow-md p-5 border-t-4 border-accent-1">
            <div className="flex items-start justify-between gap-4 ">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-ink mb-1">
                  Mustaqim Bin Burhanuddin
                </h3>
                <p className="text-md font-medium text-muted mb-2">
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
          <div className="bg-surface rounded-2xl shadow-md p-5 border-t-4 border-secondary">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-ink mb-1">
                  Sen Chan
                </h3>
                <p className="text-md font-medium text-muted mb-2">
                  Lead UI Designer - Interface Design & User Experience
                </p>
                <p className="text-sm font-semibold text-muted mb-2">
                  Link Unavailable
                </p>
              </div>
              <div className="bg-secondary/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🎨</span>
              </div>
            </div>
          </div>

          {/* Credit 2.5 */}
          <div className="bg-surface rounded-2xl shadow-md p-5 border-t-4 border-primary-base">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-ink mb-1">
                  Fatihah Binti Burhanuddin
                </h3>
                <p className="text-md font-medium text-muted mb-2">
                  UI Art Designer - Pet Character Design & Visual Assets
                </p>
                <p className="text-sm font-semibold text-muted mb-2">
                  Link Unavailable
                </p>
              </div>
              <div className="bg-secondary/20 rounded-full w-12 h-12 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">🦭</span>
              </div>
            </div>
          </div>


          {/* Credit 3 */}
          <div className="bg-surface rounded-2xl shadow-md p-5 border-t-4 border-accent-3">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-ink mb-1">
                  Jessica Li
                </h3>
                <p className="text-md font-medium text-muted mb-2">
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
          <div className="bg-surface rounded-2xl shadow-md p-5 border-t-4 border-accent-2">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-ink mb-1">
                  Jaynie Schnell
                </h3>
                <p className="text-md font-medium text-muted mb-2">
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