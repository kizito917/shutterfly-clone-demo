export default function Dialog({modalHeader, confirmButtonLabel, isOpen, closeDialog, handleConfirm, children}) {
    return (
        <>
            <div className={`fixed z-10 overflow-y-auto top-0 w-full left-0 ${!isOpen ? 'hidden' : ''}`} id="modal">
                <div className="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                    <div className="fixed inset-0 transition-opacity">
                        <div className="absolute inset-0 bg-gray-900 opacity-75" />
                    </div>
                    <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
                    <div className="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
                        <div className="bg-brand-light px-4 py-3 flex justify-between">
                            <h3>{modalHeader}</h3>
                            <button onClick={closeDialog}>
                                <svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512">
                                    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
                                </svg>
                            </button>
                        </div>
                        <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                            {/* Dialog content area */}
                                { children }
                            {/* End of dialog content area */}
                        </div>
                        <div className="bg-brand-light px-4 py-3 text-right">
                            <button type="button" className="py-2 px-4 bg-red-500 text-white rounded hover:bg-gray-700 mr-2" onClick={closeDialog}><i className="fas fa-times"></i> Cancel</button>
                            {
                                confirmButtonLabel && <button type="button" className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-700 mr-2" onClick={handleConfirm}><i className="fas fa-plus"></i> {confirmButtonLabel}</button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}