let currentStep = 1;

        function showStep(step) {
            document.querySelectorAll('.step').forEach((el, index) => {
                el.classList.add('hidden');
                if (index + 1 === step) {
                    el.classList.remove('hidden');
                }
            });

            document.querySelectorAll('.flex-1 .w-10').forEach((el, index) => {
                if (index + 1 < step) {
                    el.classList.add('bg-green-500', 'text-white');
                    el.classList.remove('bg-gray-300', 'text-gray-500');
                } else if (index + 1 === step) {
                    el.classList.add('bg-green-500', 'text-white');
                    el.classList.remove('bg-gray-300', 'text-gray-500');
                } else {
                    el.classList.add('bg-gray-300', 'text-gray-500');
                    el.classList.remove('bg-green-500', 'text-white');
                }
            });

            document.querySelector('.h-1.bg-green-500').style.width = `${(step - 1) / 2 * 100}%`;
        }

        function nextStep() {
            if (currentStep < 3) {
                currentStep++;
                showStep(currentStep);
            }
        }

        function prevStep() {
            if (currentStep > 1) {
                currentStep--;
                showStep(currentStep);
            }
        }

        showStep(currentStep);

        function goHome() {
            window.location.href = 'index.html';
        }

