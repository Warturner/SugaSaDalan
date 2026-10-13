import {
    useEffect,
    useRef,
    useState
} from 'react';

import {
    getDocument,
    GlobalWorkerOptions,
    type PDFDocumentProxy
} from 'pdfjs-dist';

import pdfWorkerUrl from
    'pdfjs-dist/build/pdf.worker.min.mjs?url';

import {
    AlertTriangle,
    Loader
} from 'lucide-react';


GlobalWorkerOptions.workerSrc =
    pdfWorkerUrl;


interface ResponsivePdfViewerProps {
    url: string;
}


export default function ResponsivePdfViewer({
    url
}: ResponsivePdfViewerProps) {

    const containerRef =
        useRef<HTMLDivElement>(null);

    const canvasRefs =
        useRef<
            Map<number, HTMLCanvasElement>
        >(new Map());

    const [
        pdfDocument,
        setPdfDocument
    ] =
        useState<PDFDocumentProxy | null>(
            null
        );

    const [
        pageCount,
        setPageCount
    ] =
        useState(0);

    const [
        containerWidth,
        setContainerWidth
    ] =
        useState(0);

    const [
        isLoading,
        setIsLoading
    ] =
        useState(true);

    const [
        error,
        setError
    ] =
        useState<string | null>(null);


    /*
     * Watch the available phone width.
     */
    useEffect(() => {

        const container =
            containerRef.current;

        if (!container) {
            return;
        }

        const updateWidth = () => {

            setContainerWidth(
                Math.floor(
                    container.clientWidth
                )
            );
        };

        updateWidth();

        const observer =
            new ResizeObserver(
                updateWidth
            );

        observer.observe(container);

        return () => {
            observer.disconnect();
        };

    }, []);


    /*
     * Load the PDF.
     */
    useEffect(() => {

        let cancelled = false;

        setIsLoading(true);
        setError(null);
        setPdfDocument(null);
        setPageCount(0);

        const loadingTask =
            getDocument({
                url
            });

        loadingTask.promise
            .then(pdf => {

                if (cancelled) {
                    return;
                }

                setPdfDocument(pdf);
                setPageCount(
                    pdf.numPages
                );

            })
            .catch(error => {

                console.error(
                    'Unable to load publication PDF:',
                    error
                );

                if (!cancelled) {

                    setError(
                        'Unable to display this publication.'
                    );

                }

            })
            .finally(() => {

                if (!cancelled) {
                    setIsLoading(false);
                }

            });

        return () => {

            cancelled = true;

            loadingTask.destroy();

        };

    }, [url]);


    /*
     * Render every PDF page so that its
     * width matches the mobile container.
     */
    useEffect(() => {

        if (
            !pdfDocument ||
            containerWidth <= 0 ||
            pageCount <= 0
        ) {
            return;
        }

        let cancelled = false;

        const renderPages = async () => {

            for (
                let pageNumber = 1;
                pageNumber <= pageCount;
                pageNumber += 1
            ) {

                if (cancelled) {
                    return;
                }

                const canvas =
                    canvasRefs.current.get(
                        pageNumber
                    );

                if (!canvas) {
                    continue;
                }

                const page =
                    await pdfDocument.getPage(
                        pageNumber
                    );

                const originalViewport =
                    page.getViewport({
                        scale: 1
                    });

                /*
                 * Leave a small amount of breathing
                 * room around each PDF page.
                 */
                const availableWidth =
                    Math.max(
                        containerWidth - 16,
                        1
                    );

                const scale =
                    availableWidth /
                    originalViewport.width;

                const viewport =
                    page.getViewport({
                        scale
                    });

                const pixelRatio =
                    Math.min(
                        window.devicePixelRatio || 1,
                        2
                    );

                const context =
                    canvas.getContext('2d');

                if (!context) {
                    continue;
                }

                canvas.width =
                    Math.floor(
                        viewport.width *
                        pixelRatio
                    );

                canvas.height =
                    Math.floor(
                        viewport.height *
                        pixelRatio
                    );

                canvas.style.width =
                    `${Math.floor(
                        viewport.width
                    )}px`;

                canvas.style.height =
                    `${Math.floor(
                        viewport.height
                    )}px`;

                await page.render({

                    canvas,

                    viewport,

                    transform:
                        pixelRatio !== 1
                            ? [
                                pixelRatio,
                                0,
                                0,
                                pixelRatio,
                                0,
                                0
                            ]
                            : undefined

                }).promise;

            }

        };

        renderPages().catch(error => {

            if (!cancelled) {

                console.error(
                    'Unable to render publication PDF:',
                    error
                );

                setError(
                    'Unable to display this publication.'
                );

            }

        });

        return () => {
            cancelled = true;
        };

    }, [
        pdfDocument,
        containerWidth,
        pageCount
    ]);


    return (

        <div
            ref={containerRef}
            className="w-full min-w-0 bg-stone-100 p-2 space-y-3"
        >

            {isLoading && (

                <div className="h-64 flex flex-col items-center justify-center text-stone-400">

                    <Loader className="w-7 h-7 animate-spin mb-3" />

                    <p className="text-[10px] font-bold uppercase tracking-widest">
                        Loading Publication
                    </p>

                </div>

            )}


            {error && (

                <div className="p-8 flex flex-col items-center justify-center text-center text-red-500">

                    <AlertTriangle className="w-8 h-8 mb-3" />

                    <p className="text-xs font-bold">
                        {error}
                    </p>

                </div>

            )}


            {!error &&
                Array.from(
                    {
                        length: pageCount
                    },
                    (_, index) =>
                        index + 1
                ).map(pageNumber => (

                    <div
                        key={pageNumber}
                        className="w-full overflow-hidden bg-white rounded-xl shadow-sm"
                    >

                        <canvas
                            ref={canvas => {

                                if (canvas) {

                                    canvasRefs.current.set(
                                        pageNumber,
                                        canvas
                                    );

                                } else {

                                    canvasRefs.current.delete(
                                        pageNumber
                                    );

                                }

                            }}
                            className="block max-w-full mx-auto"
                        />

                        <div className="py-2 text-center border-t border-stone-100">

                            <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">

                                Page {pageNumber} of {pageCount}

                            </span>

                        </div>

                    </div>

                ))}

        </div>

    );
}